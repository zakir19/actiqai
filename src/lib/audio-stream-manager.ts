/**
 * Audio Stream Manager
 * Manages audio streams between Stream.io calls and Gemini
 */

export interface AudioChunk {
  data: Buffer;
  timestamp: number;
  meetingId: string;
}

class AudioStreamManager {
  private audioBuffers: Map<string, AudioChunk[]> = new Map();
  private maxBufferSize = 100; // Keep last 100 chunks
  private subscribers: Map<string, Set<(chunk: AudioChunk) => void>> = new Map();

  /**
   * Add audio chunk from Gemini for a specific meeting
   */
  addGeminiAudio(meetingId: string, audioData: Buffer) {
    const chunk: AudioChunk = {
      data: audioData,
      timestamp: Date.now(),
      meetingId,
    };

    // Store in buffer
    if (!this.audioBuffers.has(meetingId)) {
      this.audioBuffers.set(meetingId, []);
    }

    const buffer = this.audioBuffers.get(meetingId)!;
    buffer.push(chunk);

    // Trim buffer if too large
    if (buffer.length > this.maxBufferSize) {
      buffer.shift();
    }

    // Notify subscribers
    this.notifySubscribers(meetingId, chunk);
  }

  /**
   * Subscribe to audio chunks for a meeting
   */
  subscribe(meetingId: string, callback: (chunk: AudioChunk) => void) {
    if (!this.subscribers.has(meetingId)) {
      this.subscribers.set(meetingId, new Set());
    }
    this.subscribers.get(meetingId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(meetingId)?.delete(callback);
    };
  }

  /**
   * Notify all subscribers of new audio chunk
   */
  private notifySubscribers(meetingId: string, chunk: AudioChunk) {
    const callbacks = this.subscribers.get(meetingId);
    if (callbacks) {
      callbacks.forEach((callback) => callback(chunk));
    }
  }

  /**
   * Get recent audio chunks for a meeting
   */
  getRecentAudio(meetingId: string, count = 10): AudioChunk[] {
    const buffer = this.audioBuffers.get(meetingId);
    if (!buffer) return [];
    return buffer.slice(-count);
  }

  /**
   * Clear audio buffer for a meeting
   */
  clearBuffer(meetingId: string) {
    this.audioBuffers.delete(meetingId);
    this.subscribers.delete(meetingId);
  }

  /**
   * Get all active meeting IDs
   */
  getActiveMeetings(): string[] {
    return Array.from(this.audioBuffers.keys());
  }
}

export const audioStreamManager = new AudioStreamManager();
