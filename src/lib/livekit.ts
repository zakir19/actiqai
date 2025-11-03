import "server-only";

export const LIVEKIT_URL = process.env.LIVEKIT_URL!;
export const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
export const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.warn(
    "[LiveKit] Missing LIVEKIT_URL, LIVEKIT_API_KEY or LIVEKIT_API_SECRET in env."
  );
}
