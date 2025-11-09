import { NextRequest, NextResponse } from "next/server";

// Optional STT via Deepgram REST (non-streaming): send small audio chunks (webm/opus)
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "missing DEEPGRAM_API_KEY" }, { status: 500 });

    let body: Buffer;
    let contentType = "audio/webm";

    // Handle both FormData and direct binary
    const reqContentType = req.headers.get("content-type") || "";
    if (reqContentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const audioFile = formData.get("audio") as Blob;
      if (!audioFile) {
        return NextResponse.json({ error: "missing audio file" }, { status: 400 });
      }
      body = Buffer.from(await audioFile.arrayBuffer());
      contentType = audioFile.type || "audio/webm";
    } else {
      body = Buffer.from(await req.arrayBuffer());
      contentType = reqContentType || "audio/webm";
    }

    const res = await fetch("https://api.deepgram.com/v1/listen?model=nova-2", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": contentType,
      },
      body: body as unknown as BodyInit,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Deepgram STT error", res.status, err);
      return NextResponse.json({ error: "stt_failed" }, { status: res.status });
    }

    const json = await res.json();
    // Extract transcript (depends on Deepgram response schema)
    const transcript = json?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return NextResponse.json({ transcript });
  } catch (e) {
    console.error("STT route error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
