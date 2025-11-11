import { syncAllUsageCounters } from "@/modules/premium/server/sync-counters";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await syncAllUsageCounters();
    return NextResponse.json({ success: true, message: "Usage counters synced successfully" });
  } catch (error) {
    console.error("Error syncing counters:", error);
    return NextResponse.json({ success: false, error: "Failed to sync counters" }, { status: 500 });
  }
}
