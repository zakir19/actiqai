import { NextRequest, NextResponse } from "next/server";

// Deepgram Speak TTS with safe fallbacks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: string | undefined = body?.text;
    const requestedVoice: string | undefined = body?.voice;
    const format: string = body?.format || process.env.DEEPGRAM_TTS_FORMAT || "mp3";

    if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "missing DEEPGRAM_API_KEY" }, { status: 500 });

    // Determine model to use: prefer explicit voice from client, then env, then safe default
    const envVoice = process.env.DEEPGRAM_TTS_VOICE;
    const safeDefaults = ["aura-asteria-en", "aura-luna-en"]; // public/general-access voices
    const tried: string[] = [];

    const trySpeak = async (model: string) => {
      tried.push(model);
      const params = new URLSearchParams({ model, format });
      const res = await fetch(`https://api.deepgram.com/v1/speak?${params.toString()}` , {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      return res;
    };

    // Build model candidates: requested -> env -> safe defaults
    const candidates = [requestedVoice, envVoice, ...safeDefaults].filter(Boolean) as string[];

    let lastErrBody: string | undefined;
    for (const model of candidates) {
      const res = await trySpeak(model);
      if (res.ok) {
        const audio = Buffer.from(await res.arrayBuffer());
        return new NextResponse(audio, {
          status: 200,
          headers: {
            "Content-Type": format === "wav" ? "audio/wav" : "audio/mpeg",
            "Content-Length": audio.length.toString(),
            "Cache-Control": "no-store",
          },
        });
      }
      const errText = await res.text();
      lastErrBody = errText;
      // If insufficient permissions, continue to next candidate; else break and return error
      if (!errText.includes("INSUFFICIENT_PERMISSIONS") && res.status !== 403) {
        console.error("Deepgram TTS error", res.status, errText);
        return NextResponse.json({ error: "tts_failed", tried }, { status: res.status });
      }
    }

    console.error("Deepgram TTS error 403 after fallbacks", { tried, lastErrBody });
    return NextResponse.json({ error: "tts_insufficient_permissions", tried }, { status: 403 });
  } catch (e) {
    console.error("TTS route error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
