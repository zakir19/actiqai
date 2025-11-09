"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Room } from "livekit-client";

interface VoiceAgentProps {
  botRoom: Room | null;
  meetingId: string;
}

interface AgentContext {
  agentName: string;
  agentInstructions: string;
}

/**
 * Voice Agent: Uses MediaRecorder + Deepgram STT API,
 * sends to Gemini AI with agent instructions,
 * and speaks response via Deepgram TTS in LiveKit room.
 */
export function VoiceAgent({ botRoom, meetingId }: VoiceAgentProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentContext, setAgentContext] = useState<AgentContext | null>(null);
  const [supportsSTT, setSupportsSTT] = useState(true); // MediaRecorder is widely supported
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const TTS_VOICE = process.env.NEXT_PUBLIC_DEEPGRAM_TTS_VOICE as string | undefined;

  // Fetch agent context on mount
  useEffect(() => {
    const fetchAgentContext = async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}/agent`);
        if (res.ok) {
          const data = await res.json();
          setAgentContext({
            agentName: data.agentName,
            agentInstructions: data.agentInstructions,
          });
        }
      } catch {
        // Silent error
      }
    };
    fetchAgentContext();
  }, [meetingId]);

  const publishAudioToRoom = useCallback(async (blob: Blob) => {
    if (!botRoom) return;
    try {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stream: MediaStream | undefined = (audio as any).captureStream
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (audio as any).captureStream()
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (audio as any).mozCaptureStream?.();
      await audio.play();
      if (stream) {
        const [track] = stream.getAudioTracks();
        if (track) await botRoom.localParticipant.publishTrack(track);
      }
    } catch {
      // Silent error
    }
  }, [botRoom]);

  const handleUserSpeech = useCallback(async (userPrompt: string) => {
    if (!userPrompt || !botRoom) return;

    setTranscript("");

    try {
      setIsSpeaking(true);

      // Save user's question to transcript
      await fetch(`/api/meetings/${meetingId}/transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speaker: "User",
          text: userPrompt,
        }),
      });
      
      // Get AI response with agent-specific instructions
      const aiRes = await fetch("/api/ai/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: userPrompt,
          system: agentContext?.agentInstructions || "You are a helpful AI assistant. Be concise and natural in your responses.",
        }),
      });
      const { text: reply } = await aiRes.json();

      if (!reply) {
        setIsSpeaking(false);
        return;
      }

      // Save AI's response to transcript
      await fetch(`/api/meetings/${meetingId}/transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speaker: agentContext?.agentName || "AI Agent",
          text: reply,
        }),
      });

      // Generate TTS
      const ttsBody: Record<string, unknown> = { text: reply, format: "mp3" };
      if (TTS_VOICE) ttsBody.voice = TTS_VOICE;
      
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ttsBody),
      });

      if (!ttsRes.ok) {
        setIsSpeaking(false);
        return;
      }

      const blob = await ttsRes.blob();
      await publishAudioToRoom(blob);
    } catch {
      // Silent error
    } finally {
      setIsSpeaking(false);
    }
  }, [botRoom, TTS_VOICE, publishAudioToRoom, agentContext, meetingId]);

  // Start/stop listening with MediaRecorder + Deepgram
  const toggleListening = useCallback(async () => {
    if (isListening) {
      // Stop listening
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
    } else {
      // Start listening
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          
          // Send to Deepgram API
          try {
            const formData = new FormData();
            formData.append('audio', audioBlob);
            
            const response = await fetch('/api/stt', {
              method: 'POST',
              body: formData,
            });

            if (response.ok) {
              const data = await response.json();
              const transcribedText = data.transcript || "";
              
              if (transcribedText.trim()) {
                await handleUserSpeech(transcribedText.trim());
              } else {
                setTranscript("No speech detected");
              }
            } else {
              console.error("[Voice Agent] STT API error:", response.status);
              alert("Failed to transcribe audio. Please try again.");
            }
          } catch (error) {
            console.error("[Voice Agent] STT error:", error);
            alert("Error transcribing audio. Please try again.");
          }

          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          setIsListening(false);
        };

        mediaRecorder.onerror = (event) => {
          console.error("[Voice Agent] MediaRecorder error:", event);
          alert("Recording error. Please check microphone permissions.");
          setIsListening(false);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsListening(true);

        // Auto-stop after 10 seconds to prevent infinite recording
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        }, 10000);

      } catch (error) {
        console.error("[Voice Agent] Microphone access error:", error);
        alert("Microphone access denied. Please allow microphone permissions and try again.");
        setIsListening(false);
      }
    }
  }, [isListening, handleUserSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white rounded-lg p-4 max-w-sm shadow-xl border border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-lg font-bold">
          {agentContext?.agentName?.charAt(0) || "A"}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{agentContext?.agentName || "AI Assistant"}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isListening ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
            <span className="text-xs text-white/70">
              {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Idle"}
            </span>
          </div>
        </div>
      </div>

      {/* Control Button */}
      <button
        onClick={toggleListening}
        disabled={isSpeaking || !supportsSTT}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isListening
            ? "bg-red-600 hover:bg-red-700"
            : "bg-cyan-600 hover:bg-cyan-700"
        } disabled:bg-gray-600 disabled:cursor-not-allowed`}
      >
        {isSpeaking ? "Speaking..." : isListening ? "Stop Listening" : "Start Listening"}
      </button>

      {!supportsSTT && (
        <div className="mt-2 text-xs text-yellow-400">
          ⚠️ Speech recognition not supported. Use Chrome/Edge browser.
        </div>
      )}

      {isSpeaking && (
        <div className="mt-3 text-sm text-cyan-400 flex items-center gap-2">
          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3a1 1 0 011 1v1h1a4 4 0 014 4v2a4 4 0 01-4 4h-1v1a1 1 0 11-2 0v-1H8a4 4 0 01-4-4V9a4 4 0 014-4h1V4a1 1 0 011-1z" />
          </svg>
          AI is responding...
        </div>
      )}

      {transcript && (
        <div className="mt-3 p-2 bg-white/5 rounded text-xs text-white/90 border border-white/10">
          <strong className="text-cyan-400">You:</strong> {transcript}
        </div>
      )}
    </div>
  );
}
