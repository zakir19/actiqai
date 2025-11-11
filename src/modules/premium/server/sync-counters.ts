import { db } from "@/db";
import { user, agents, meetings } from "@/db/schema";
import { eq, count } from "drizzle-orm";

/**
 * Sync usage counters for all users
 * Run this once to fix existing data
 */
export async function syncAllUsageCounters() {
  const users = await db.select({ id: user.id }).from(user);

  for (const currentUser of users) {
    // Count actual agents
    const [agentCount] = await db
      .select({ count: count() })
      .from(agents)
      .where(eq(agents.userId, currentUser.id));

    // Count actual meetings
    const [meetingCount] = await db
      .select({ count: count() })
      .from(meetings)
      .where(eq(meetings.userId, currentUser.id));

    // Update counters
    await db
      .update(user)
      .set({
        agentsUsed: agentCount.count,
        meetingsUsed: meetingCount.count,
      })
      .where(eq(user.id, currentUser.id));

    console.log(`✅ Synced user ${currentUser.id}: ${agentCount.count} agents, ${meetingCount.count} meetings`);
  }

  console.log("✅ All usage counters synced!");
}
