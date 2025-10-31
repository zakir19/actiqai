import { NextRequest, NextResponse } from "next/server";
import { audioStreamManager } from "@/lib/audio-stream-manager";

export const dynamic = "force-dynamic";

/**
 * Stream Gemini audio to the client using Server-Sent Events (SSE)
 */
export async function GET(
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

  // Create a ReadableStream for Server-Sent Events
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      console.log("🎧 Client connected to audio stream for meeting:", meetingId);

      // Subscribe to audio chunks for this meeting
      const unsubscribe = audioStreamManager.subscribe(meetingId, (chunk) => {
        // Send audio chunk as Server-Sent Event
        const data = {
          timestamp: chunk.timestamp,
          audioData: chunk.data.toString("base64"),
          size: chunk.data.length,
        };

        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      });

      // Send initial connection message
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "connected", meetingId })}\n\n`
        )
      );

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        console.log("🔌 Client disconnected from audio stream:", meetingId);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in nginx
    },
  });
}
