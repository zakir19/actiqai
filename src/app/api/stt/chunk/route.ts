import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Streaming STT endpoint: receives raw audio chunks and returns transcripts
 * Uses Deepgram REST API directly for better compatibility with raw PCM audio
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      console.error("[STT] Missing DEEPGRAM_API_KEY");
      return NextResponse.json({ error: "missing DEEPGRAM_API_KEY" }, { status: 500 });
    }

    const sampleRate = req.headers.get("X-Sample-Rate") || "16000";
    const audioBuffer = await req.arrayBuffer();
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return NextResponse.json({ transcript: "" }, { status: 200 });
    }

    // Skip very small audio chunks (likely silence or noise)
    if (audioBuffer.byteLength < 4000) {
      return NextResponse.json({ transcript: "" }, { status: 200 });
    }

    console.log(`[STT] Processing audio chunk: ${audioBuffer.byteLength} bytes at ${sampleRate}Hz`);

    // Create WAV header for raw PCM data
    const wavBuffer = createWavBuffer(Buffer.from(audioBuffer), parseInt(sampleRate));

    // Call Deepgram REST API directly
    const response = await fetch(
      `https://api.deepgram.com/v1/listen?model=nova-2&language=en&punctuate=true&smart_format=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "audio/wav",
        },
        body: new Uint8Array(wavBuffer),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[STT] Deepgram error:", response.status, errorText);
      return NextResponse.json({ transcript: "" }, { status: 200 });
    }

    const result = await response.json();
    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    
    if (transcript) {
      console.log("[STT] Transcribed:", transcript);
    }
    
    return NextResponse.json({ transcript }, { status: 200 });
  } catch (e) {
    console.error("[STT] Chunk route error", e);
    return NextResponse.json({ transcript: "" }, { status: 200 });
  }
}

/**
 * Create a WAV file buffer from raw PCM data
 */
function createWavBuffer(pcmData: Buffer, sampleRate: number): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;

  const header = Buffer.alloc(44);
  
  // RIFF chunk descriptor
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  
  // fmt sub-chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // audio format (1 = PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  
  // data sub-chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  
  return Buffer.concat([header, pcmData]);
}
