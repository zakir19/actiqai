"use client";
import { LiveKitRoom, GridLayout, RoomAudioRenderer, ParticipantTile, useTracks } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useRef, useState } from "react";
import { Room, Track } from "livekit-client";
import { VoiceAgent } from "./voice-agent-simple";

async function fetchToken(room: string, identity: string, name?: string) {
  const res = await fetch("/api/livekit/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, identity, name }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "token_error");
  return json.token as string;
}

function usePublishTTS(targetRoom: Room | null) {
  const [publishing, setPublishing] = useState(false);

  const publishBlob = async (blob: Blob) => {
    if (!targetRoom) return;
    setPublishing(true);
    try {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      // captureStream is not in the standard DOM typings; cast to permit usage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stream: MediaStream | undefined = (audio as any).captureStream
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (audio as any).captureStream()
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (audio as any).mozCaptureStream?.();
      await audio.play();
      if (stream) {
        const [track] = stream.getAudioTracks();
        if (track) {
          await targetRoom.localParticipant.publishTrack(track);
        }
      }
    } finally {
      setPublishing(false);
    }
  };

  return { publishBlob, publishing };
}

export function AIAgent({ botRoom }: { botRoom: Room | null }) {
  const [pending, setPending] = useState(false);
  const [lastResponse, setLastResponse] = useState("");
  const { publishBlob } = usePublishTTS(botRoom);
  const inputRef = useRef<HTMLInputElement>(null);
  const TTS_VOICE = process.env.NEXT_PUBLIC_DEEPGRAM_TTS_VOICE as string | undefined;

  const ask = async () => {
    const text = inputRef.current?.value?.trim();
    if (!text) return;
    setPending(true);
    try {
      const aiRes = await fetch("/api/ai/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const { text: reply } = await aiRes.json();
      setLastResponse(reply || "");

      // build body with optional voice only if provided
      const ttsBody: Record<string, unknown> = { text: reply, format: "mp3" };
      if (TTS_VOICE) ttsBody.voice = TTS_VOICE;
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ttsBody),
      });
      if (!ttsRes.ok) {
        const errText = await ttsRes.text();
        console.error("TTS request failed", ttsRes.status, errText);
        return; // don't attempt to play/publish on failure
      }
      const ttsBlob = await ttsRes.blob();
      await publishBlob(ttsBlob);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white rounded-lg p-3 flex gap-2 items-center">
      <input ref={inputRef} className="px-2 py-1 rounded text-black" placeholder="Ask the AI..." />
      <button disabled={pending} onClick={ask} className="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded">
        {pending ? "Thinking..." : "Ask"}
      </button>
      {lastResponse && <span className="text-xs text-white/70 max-w-[40ch] truncate">{lastResponse}</span>}
    </div>
  );
}

function TracksGrid() {
  const tracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: true }]);
  return (
    <GridLayout tracks={tracks}>
      <ParticipantTile />
    </GridLayout>
  );
}

export function ClientRoom({ url, roomName, identity, displayName, meetingId }: { url: string; roomName: string; identity: string; displayName?: string; meetingId?: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [botToken, setBotToken] = useState<string | null>(null);
  const [botRoom, setBotRoom] = useState<Room | null>(null);
  const botConnRef = useRef<Room | null>(null);
  const TTS_VOICE = process.env.NEXT_PUBLIC_DEEPGRAM_TTS_VOICE as string | undefined;

  useEffect(() => {
    fetchToken(roomName, identity, displayName).then(setToken).catch(console.error);
    // create/join bot identity for AI agent
    const botIdentity = `agent-${roomName}`;
    fetchToken(roomName, botIdentity, "AI Agent").then(setBotToken).catch(console.error);
  }, [roomName, identity, displayName]);

  // Connect bot room when we have bot token
  useEffect(() => {
    if (!botToken || !url) return;
    let cancelled = false;
    const connectBot = async () => {
      try {
        const r = new Room();
        await r.connect(url, botToken);
        if (cancelled) {
          try { r.disconnect(); } catch {}
          return;
        }
        botConnRef.current = r;
        setBotRoom(r);
        // Greet once on join
        try {
          const greet = "Hello! I'm your AI assistant. How can I help you today?";
          const greetBody: Record<string, unknown> = { text: greet, format: "mp3" };
          if (TTS_VOICE) greetBody.voice = TTS_VOICE;
          const ttsRes = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(greetBody),
          });
          if (!ttsRes.ok) {
            const errText = await ttsRes.text();
            console.error("AI greet TTS failed", ttsRes.status, errText);
          } else {
            const blob = await ttsRes.blob();
            const urlObj = URL.createObjectURL(blob);
            const audio = new Audio(urlObj);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stream: MediaStream | undefined = (audio as any).captureStream
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (audio as any).captureStream()
              : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (audio as any).mozCaptureStream?.();
            await audio.play();
            if (stream) {
              const [track] = stream.getAudioTracks();
              if (track) await r.localParticipant.publishTrack(track);
            }
          }
        } catch (e) {
          console.error("AI greet failed", e);
        }
      } catch (e) {
        console.error("Bot connect failed", e);
      }
    };
    connectBot();
    return () => {
      cancelled = true;
      const r = botConnRef.current;
      if (r) {
        try { r.disconnect(); } catch {}
        botConnRef.current = null;
      }
      setBotRoom(null);
    };
  }, [botToken, url, TTS_VOICE]);

  if (!token) return <div className="h-screen flex items-center justify-center">Connecting...</div>;

  return (
    <LiveKitRoom serverUrl={url} token={token} connect audio video={false}>
      <TracksGrid />
      <RoomAudioRenderer />
      {meetingId && <VoiceAgent botRoom={botRoom} meetingId={meetingId} />}
    </LiveKitRoom>
  );
}
