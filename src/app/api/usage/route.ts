import { getUserUsageAndPlan } from "@/modules/premium/server/procedures";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getUserUsageAndPlan();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
