import "server-only";

import { StreamChat } from "stream-chat";

const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY;
const secretKey = process.env.STREAM_CHAT_SECRET_KEY;

if (!apiKey || !secretKey) {
  console.warn(
    "[Stream Chat] Missing NEXT_PUBLIC_STREAM_CHAT_API_KEY or STREAM_CHAT_SECRET_KEY in env."
  );
}

export const streamChat = apiKey && secretKey
  ? StreamChat.getInstance(apiKey, secretKey)
  : null;
