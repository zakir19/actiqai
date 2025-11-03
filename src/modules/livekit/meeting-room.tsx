"use client";
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant, useParticipants } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useRef, useState } from "react";
import { Room } from "livekit-client";
import { VoiceAgent } from "./voice-agent-simple";
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, PhoneOffIcon, Settings, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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

function CallControls({ onLeave }: { onLeave: () => void }) {
  const { localParticipant } = useLocalParticipant();
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const toggleMic = async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!micEnabled);
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCamera = async () => {
    if (localParticipant) {
      await localParticipant.setCameraEnabled(!cameraEnabled);
      setCameraEnabled(!cameraEnabled);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-white text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Recording in progress</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={toggleMic}
            size="lg"
            variant={micEnabled ? "secondary" : "destructive"}
            className="rounded-full w-14 h-14 p-0"
          >
            {micEnabled ? <MicIcon className="w-5 h-5" /> : <MicOffIcon className="w-5 h-5" />}
          </Button>

          <Button
            onClick={toggleCamera}
            size="lg"
            variant={cameraEnabled ? "secondary" : "destructive"}
            className="rounded-full w-14 h-14 p-0"
          >
            {cameraEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOffIcon className="w-5 h-5" />}
          </Button>

          <Button
            onClick={onLeave}
            size="lg"
            variant="destructive"
            className="rounded-full w-14 h-14 p-0 bg-red-600 hover:bg-red-700"
          >
            <PhoneOffIcon className="w-5 h-5" />
          </Button>

          <Button size="lg" variant="ghost" className="rounded-full w-14 h-14 p-0 text-white">
            <Settings className="w-5 h-5" />
          </Button>

          <Button size="lg" variant="ghost" className="rounded-full w-14 h-14 p-0 text-white">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>

        <div className="w-32" /> {/* Spacer for centering */}
      </div>
    </div>
  );
}

function ParticipantView() {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  return (
    <div className="flex-1 bg-gray-900 relative overflow-hidden">
      {/* Main video area - shows user or empty state */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-4xl max-h-[80vh] bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          {/* User placeholder */}
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="w-32 h-32 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-4xl font-bold">
              {localParticipant?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h3 className="text-2xl font-semibold">{localParticipant?.name || "You"}</h3>
              <p className="text-sm text-gray-400 mt-1">Camera is off</p>
            </div>
          </div>

          {/* Participant count badge */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MeetingRoom({ url, roomName, identity, displayName, meetingId }: { url: string; roomName: string; identity: string; displayName?: string; meetingId?: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [botToken, setBotToken] = useState<string | null>(null);
  const [botRoom, setBotRoom] = useState<Room | null>(null);
  const botConnRef = useRef<Room | null>(null);
  const router = useRouter();
  const TTS_VOICE = process.env.NEXT_PUBLIC_DEEPGRAM_TTS_VOICE as string | undefined;

  useEffect(() => {
    fetchToken(roomName, identity, displayName).then(setToken).catch(console.error);
    // create/join bot identity for AI agent
    const botIdentity = `agent-${roomName}`;
    fetchToken(roomName, botIdentity, "AI Agent").then(setBotToken).catch(console.error);
    
    // Mark meeting as active when joining
    if (meetingId) {
      fetch(`/api/meetings/${meetingId}/start`, {
        method: "POST",
      }).catch(console.error);
    }
  }, [roomName, identity, displayName, meetingId]);

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

  const handleLeave = async () => {
    if (botConnRef.current) {
      try { botConnRef.current.disconnect(); } catch {}
    }

    // Mark meeting as processing and trigger summary generation
    if (meetingId) {
      try {
        await fetch(`/api/meetings/${meetingId}/end`, {
          method: "POST",
        });
      } catch {
        // Silent error - user is leaving anyway
      }
    }

    router.push(meetingId ? `/meetings/${meetingId}` : '/meetings');
  };

  if (!token) return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg">Connecting to meeting...</p>
      </div>
    </div>
  );

  return (
    <LiveKitRoom serverUrl={url} token={token} connect audio video={false} className="h-screen flex flex-col">
      <ParticipantView />
      <CallControls onLeave={handleLeave} />
      <RoomAudioRenderer />
      {meetingId && <VoiceAgent botRoom={botRoom} meetingId={meetingId} />}
    </LiveKitRoom>
  );
}
