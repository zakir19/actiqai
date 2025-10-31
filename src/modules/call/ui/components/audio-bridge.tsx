"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

interface AudioBridgeProps {
  meetingId: string;
}

/**
 * AudioBridge Component
 * Handles bidirectional audio streaming between Stream.io call and Gemini
 * 
 * Flow:
 * 1. Captures audio from Stream.io call microphone
 * 2. Sends captured audio to Gemini via API
 * 3. Receives Gemini's audio responses via SSE
 * 4. Plays Gemini audio through speaker
 */
export const AudioBridge = ({ meetingId }: AudioBridgeProps) => {
  const { useMicrophoneState } = useCallStateHooks();
  const { mediaStream } = useMicrophoneState();
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [audioQueueSize, setAudioQueueSize] = useState(0);

  /**
   * Create WAV file buffer from PCM data
   */
  const createWavBuffer = useCallback((pcmData: Buffer, sampleRate: number): ArrayBuffer => {
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true); // Format chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, "data");
    view.setUint32(40, pcmData.length, true);

    // Copy PCM data
    const dataView = new Uint8Array(buffer, 44);
    for (let i = 0; i < pcmData.length; i++) {
      dataView[i] = pcmData[i];
    }

    return buffer;
  }, []);

  /**
   * Play audio received from Gemini
   */
  const playGeminiAudio = useCallback(async (base64Audio: string) => {
    try {
      // Decode base64 audio
      const audioData = Buffer.from(base64Audio, "base64");
      
      // Convert PCM to WAV format for playback
      const wavBuffer = createWavBuffer(audioData, 24000);
      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      // Play audio
      const audio = new Audio(url);
      audio.play();
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setAudioQueueSize((prev) => Math.max(0, prev - 1));
      };

      console.log("🔊 Playing Gemini audio:", audioData.length, "bytes");
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }, [createWavBuffer]);

  /**
   * Send captured audio to Gemini
   */
  const sendAudioToGemini = useCallback(async (audioChunks: Float32Array[]) => {
    try {
      // Combine chunks
      const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const combinedAudio = new Float32Array(totalLength);
      
      let offset = 0;
      for (const chunk of audioChunks) {
        combinedAudio.set(chunk, offset);
        offset += chunk.length;
      }

      // Convert Float32Array to Int16Array (PCM 16-bit)
      const int16Audio = new Int16Array(combinedAudio.length);
      for (let i = 0; i < combinedAudio.length; i++) {
        const s = Math.max(-1, Math.min(1, combinedAudio[i]));
        int16Audio[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // Convert to base64
      const audioBuffer = Buffer.from(int16Audio.buffer);
      const audioData = audioBuffer.toString("base64");

      // Send to server
      await fetch(`/api/send-audio/${meetingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioData }),
      });

      console.log("🎤 Sent", int16Audio.length * 2, "bytes to Gemini");
    } catch (error) {
      console.error("Error sending audio to Gemini:", error);
    }
  }, [meetingId]);

  // Connect to Gemini audio stream (receive audio)
  useEffect(() => {
    const eventSource = new EventSource(`/api/audio-stream/${meetingId}`);

    eventSource.onopen = () => {
      console.log("🎧 Connected to Gemini audio stream");
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          console.log("✅ Audio stream connection confirmed");
          return;
        }

        if (data.audioData) {
          // Play received audio
          playGeminiAudio(data.audioData);
          setAudioQueueSize((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error processing audio event:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Audio stream error:", error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [meetingId, playGeminiAudio]);

  // Capture and send audio to Gemini
  useEffect(() => {
    if (!mediaStream) {
      console.log("⏸️ No media stream available");
      return;
    }

    console.log("🎤 Setting up audio capture from microphone");

    const audioContext = new AudioContext({ sampleRate: 24000 }); // Match Gemini's sample rate
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(mediaStream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    let audioBuffer: Float32Array[] = [];
    let lastSendTime = Date.now();
    const SEND_INTERVAL = 100; // Send audio every 100ms

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Store audio data
      audioBuffer.push(new Float32Array(inputData));

      // Send buffered audio periodically
      if (Date.now() - lastSendTime >= SEND_INTERVAL && audioBuffer.length > 0) {
        sendAudioToGemini(audioBuffer);
        audioBuffer = [];
        lastSendTime = Date.now();
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    return () => {
      processor.disconnect();
      source.disconnect();
      audioContext.close();
    };
  }, [mediaStream, sendAudioToGemini]);

  return (
    <div className="fixed bottom-24 left-4 bg-[#101213]/95 backdrop-blur-sm rounded-lg p-3 z-20">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        <span className="text-white text-xs font-medium">
          {isConnected ? "AI Agent Connected" : "AI Agent Offline"}
        </span>
      </div>
      {isConnected && audioQueueSize > 0 && (
        <div className="text-cyan-400 text-xs mt-1">
          🔊 Playing audio ({audioQueueSize} queued)
        </div>
      )}
    </div>
  );
};
