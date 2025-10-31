import { NextRequest, NextResponse } from "next/server";
import { geminiSessionManager } from "@/lib/gemini-session-manager";

/**
 * Receive audio from client and send to Gemini
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await params;

  if (!meetingId) {
    return NextResponse.json(
      { error: "Meeting ID is required" },
      { status: 400 }
    );
  }

  try {
    // Get audio data from request body
    const body = await req.json();
    const { audioData } = body;

    if (!audioData) {
      return NextResponse.json(
        { error: "Audio data is required" },
        { status: 400 }
      );
    }

    // Get Gemini session for this meeting
    const geminiSession = geminiSessionManager.getSession(meetingId);

    if (!geminiSession) {
      return NextResponse.json(
        { error: "No active Gemini session for this meeting" },
        { status: 404 }
      );
    }

    // Convert base64 audio data to Buffer
    const audioBuffer = Buffer.from(audioData, "base64");
    
    console.log("🎤 Sending audio to Gemini:", audioBuffer.length, "bytes");

    // Send audio to Gemini
    geminiSession.sendAudio(audioBuffer);

    return NextResponse.json({
      success: true,
      bytesProcessed: audioBuffer.length,
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Failed to process audio" },
      { status: 500 }
    );
  }
}
