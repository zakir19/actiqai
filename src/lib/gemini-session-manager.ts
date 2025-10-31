import { GeminiRealtimeClient } from "./gemini-realtime";

// In-memory store for active Gemini sessions
// In production, you might want to use Redis or another distributed cache
class GeminiSessionManager {
  private sessions: Map<string, GeminiRealtimeClient> = new Map();

  setSession(meetingId: string, client: GeminiRealtimeClient) {
    this.sessions.set(meetingId, client);
  }

  getSession(meetingId: string): GeminiRealtimeClient | undefined {
    return this.sessions.get(meetingId);
  }

  async endSession(meetingId: string) {
    const client = this.sessions.get(meetingId);
    if (client) {
      client.disconnect();
      this.sessions.delete(meetingId);
    }
  }

  hasSession(meetingId: string): boolean {
    return this.sessions.has(meetingId);
  }
}

export const geminiSessionManager = new GeminiSessionManager();
