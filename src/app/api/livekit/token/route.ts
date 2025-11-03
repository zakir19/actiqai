import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET } from "@/lib/livekit";

export async function POST(req: NextRequest) {
  try {
    const { room, identity, name } = await req.json();
    if (!room || !identity) {
      return NextResponse.json({ error: "room and identity required" }, { status: 400 });
    }

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name,
    });
    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (e) {
    console.error("LiveKit token error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
