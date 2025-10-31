# Audio Integration TODO

## Current Status

### ✅ What's Working

1. **Gemini WebSocket Connection**
   - Successfully connecting to Gemini Multimodal Live API
   - Receiving audio responses from Gemini (PCM format, 24kHz)
   - Gemini is processing text and responding with audio + text

2. **AI Agent Visibility**
   - AI agent appears in participant list with custom avatar
   - Special "AI" badge and styling
   - Displayed even when not actively connected via WebRTC

3. **Call Lifecycle**
   - Webhook triggers when call starts
   - Gemini session created and connected
   - Session cleaned up when call ends

### ❌ What's NOT Working

1. **Audio Not Piped to Call**
   - Gemini generates audio responses (visible in logs)
   - Audio is NOT being sent to Stream.io call participants
   - Users cannot hear the AI agent speaking

2. **Call Audio Not Sent to Gemini**
   - Participant audio is NOT being captured from Stream.io
   - Gemini cannot hear what users are saying
   - Currently one-way: Gemini → Void (nowhere)

## The Problem

### Gemini Audio Output (Current Logs)

```
Gemini response parts: [
  {
    "inlineData": {
      "mimeType": "audio/pcm;rate=24000",
      "data": "jABnAKsAiADc/2v/cv87/+f+..." // Base64 PCM audio
    }
  }
]
📢 Received audio from Gemini: 11520 bytes
```

This audio is being **received but not played** anywhere.

### What We Need

```
[Stream.io Call Audio] ──┐
                          ├──> [Audio Mixer/Processor] ──> [Gemini WebSocket]
                          │
                          └──> [Human Participants]

[Gemini Audio Response] ──> [Audio Injector] ──> [Stream.io Call]
```

## Solution Options

### Option 1: Server-Side WebRTC (Complex but Complete)

Use a server-side WebRTC library to join the call as a real participant:

**Pros:**
- AI agent appears as real participant with audio/video streams
- Full bidirectional audio
- Most reliable

**Cons:**
- Complex implementation
- Need WebRTC server setup (TURN/STUN)
- Resource intensive (media processing on server)

**Libraries:**
- `@roamhq/wrtc` - WebRTC for Node.js
- `mediasoup` - WebRTC SFU
- `node-webrtc` - Native WebRTC bindings

**Implementation Steps:**
1. Install WebRTC library
2. Create RTC Peer Connection using agent token
3. Join Stream.io call as agent user
4. Capture audio from call → send to Gemini
5. Receive audio from Gemini → send to call

### Option 2: Stream.io Egress + Ingress (Recommended)

Use Stream.io's built-in egress/ingress features:

**Egress** - Export call audio to external service (Gemini)
**Ingress** - Inject external audio (Gemini) into call

**Pros:**
- No complex WebRTC implementation
- Stream.io handles media routing
- Scalable

**Cons:**
- Requires Stream.io Enterprise plan (may cost money)
- Less control over audio processing

**Implementation:**
```typescript
// Start egress to capture call audio
const egress = await call.startRTMPBroadcast({
  name: 'gemini-audio-capture',
  streamUrl: 'rtmp://your-server/gemini-input'
});

// Start ingress to inject Gemini audio
const ingress = await streamVideo.createIngress({
  name: 'gemini-audio-output',
  type: 'rtmp'
});
```

### Option 3: Client-Side Audio Capture (Simpler, Limited)

Capture audio on client side and send to Gemini via your server:

**Pros:**
- Easier to implement
- No server-side WebRTC
- Works with current setup

**Cons:**
- Each client sends separate audio (not mixed)
- Higher latency
- More bandwidth usage

**Implementation:**
```typescript
// In meeting component
const { useMicrophoneState } = useCallStateHooks();
const { mediaStream } = useMicrophoneState();

// Send audio to server via WebSocket
const audioContext = new AudioContext();
const source = audioContext.createMediaStreamSource(mediaStream);
const processor = audioContext.createScriptProcessor(1024, 1, 1);

processor.onaudioprocess = (e) => {
  const audioData = e.inputBuffer.getChannelData(0);
  sendToServer(audioData); // Send to your WebSocket endpoint
};
```

## Recommended Approach

### Phase 1: Basic Audio Playback (Quick Win)

1. Create an audio player endpoint that serves Gemini audio
2. Update participant list to show "AI is speaking" indicator
3. Play audio through browser (not in call, but audible)

**File:** `/src/app/api/audio-stream/[meetingId]/route.ts`

```typescript
export async function GET(req: Request, { params }: { params: { meetingId: string } }) {
  // Stream Gemini audio responses as Server-Sent Events
  const session = geminiSessionManager.getSession(params.meetingId);
  
  // Return audio stream
  return new Response(audioStream, {
    headers: {
      'Content-Type': 'audio/pcm',
      'Cache-Control': 'no-cache'
    }
  });
}
```

### Phase 2: Client-Side Integration

1. Add audio capture from microphone
2. Send to Gemini via WebSocket
3. Receive responses and play in call

### Phase 3: Full Server-Side WebRTC (Future)

1. Implement proper WebRTC participant
2. Full bidirectional audio
3. Production-ready solution

## Current File Updates Needed

### 1. Update `gemini-realtime.ts`

Add method to get audio stream:

```typescript
export class GeminiRealtimeClient {
  private audioBuffer: Buffer[] = [];
  
  onAudioReceived(callback: (audio: Buffer) => void) {
    this.audioCallback = callback;
  }
  
  // In handleMessage when receiving audio:
  if (this.audioCallback) {
    this.audioCallback(audioBuffer);
  }
}
```

### 2. Update `webhook/route.ts`

Store audio for playback:

```typescript
geminiSession.onAudioReceived((audio) => {
  // Store or stream audio
  audioStreamManager.addAudioChunk(meetingId, audio);
});
```

### 3. Create Audio Stream Endpoint

New file: `/src/app/api/audio-stream/[meetingId]/route.ts`

## Testing Current Setup

To verify Gemini is working:

1. Start a meeting
2. Check terminal logs for:
   ```
   ✅ Gemini WebSocket connected
   📢 Received audio from Gemini: XXXX bytes
   ```
3. AI agent should appear in participant list
4. Audio is being generated but not played

## Next Steps

1. **Immediate:** Add audio playback endpoint (Phase 1)
2. **Short-term:** Implement client-side audio capture (Phase 2)
3. **Long-term:** Evaluate Stream.io Egress/Ingress or server-side WebRTC (Phase 3)

## Resources

- [Stream.io Server-Side Integration](https://getstream.io/video/docs/api/server-side/)
- [Gemini Multimodal Live API](https://ai.google.dev/api/multimodal-live)
- [WebRTC for Node.js](https://github.com/node-webrtc/node-webrtc)
- [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)
