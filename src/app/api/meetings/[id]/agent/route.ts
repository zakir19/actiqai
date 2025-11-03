import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { meetings, agents } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get agent information for a meeting (used by voice agent to apply instructions)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [meeting] = await db
      .select({
        meetingId: meetings.id,
        meetingName: meetings.name,
        agentId: agents.id,
        agentName: agents.name,
        agentInstructions: agents.instructions,
      })
      .from(meetings)
      .innerJoin(agents, eq(meetings.agentId, agents.id))
      .where(eq(meetings.id, id));

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(meeting, { status: 200 });
  } catch (e) {
    console.error("Get meeting agent error", e);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
