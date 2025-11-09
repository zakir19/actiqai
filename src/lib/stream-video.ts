import "server-only";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
const secretKey = process.env.STREAM_VIDEO_SECRET_KEY;

if (!apiKey || !secretKey) {
  console.warn(
    "[Stream Video] Missing NEXT_PUBLIC_STREAM_VIDEO_API_KEY or STREAM_VIDEO_SECRET_KEY in env."
  );
}

export const streamVideo = apiKey && secretKey 
  ? new StreamClient(apiKey, secretKey)
  : null;
