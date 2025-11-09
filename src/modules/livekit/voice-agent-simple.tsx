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

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

/**
 * Voice Agent: Uses browser's Web Speech API for STT,
 * sends to Gemini AI with agent instructions,
 * and speaks response via Deepgram TTS in LiveKit room.
 */
export function VoiceAgent({ botRoom, meetingId }: VoiceAgentProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentContext, setAgentContext] = useState<AgentContext | null>(null);
  const [supportsSTT, setSupportsSTT] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const TTS_VOICE = process.env.NEXT_PUBLIC_DEEPGRAM_TTS_VOICE as string | undefined;

  // Check if browser supports Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupportsSTT(!!SpeechRecognition);
  }, []);

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

  // Start/stop listening
  const toggleListening = useCallback(() => {
    if (!supportsSTT) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      // Start listening
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          handleUserSpeech(finalTranscript.trim());
        } else if (interimTranscript) {
          setTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("[Voice Agent] Speech recognition error:", event.error);
        setIsListening(false);
        
        // Show user-friendly error messages
        if (event.error === 'no-speech') {
          alert("No speech detected. Please try again and speak clearly.");
        } else if (event.error === 'not-allowed') {
          alert("Microphone access denied. Please allow microphone permissions and try again.");
        } else if (event.error === 'network') {
          alert("Network error. Please check your internet connection.");
        } else {
          alert(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log("[Voice Agent] Speech recognition ended");
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  }, [isListening, supportsSTT, handleUserSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
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
