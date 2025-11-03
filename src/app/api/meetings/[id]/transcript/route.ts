import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: meetingId } = await context.params;
    const body = await req.json();
    const { speaker, text } = body as { speaker: string; text: string };

    if (!speaker || !text) {
      return NextResponse.json(
        { error: "Missing speaker or text" },
        { status: 400 }
      );
    }

    // Get current meeting
    const [meeting] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId));

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Parse existing transcript or create new array
    let transcript: TranscriptEntry[] = [];
    if (meeting.transcript) {
      try {
        transcript = JSON.parse(meeting.transcript) as TranscriptEntry[];
      } catch (e) {
        console.error("Failed to parse transcript:", e);
        transcript = [];
      }
    }

    // Add new entry
    transcript.push({
      speaker,
      text,
      timestamp: new Date().toISOString(),
    });

    // Update meeting with new transcript
    await db
      .update(meetings)
      .set({
        transcript: JSON.stringify(transcript),
      })
      .where(eq(meetings.id, meetingId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving transcript:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: meetingId } = await context.params;

    const [meeting] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId));

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    let transcript: TranscriptEntry[] = [];
    if (meeting.transcript) {
      try {
        transcript = JSON.parse(meeting.transcript) as TranscriptEntry[];
      } catch (e) {
        console.error("Failed to parse transcript:", e);
      }
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
