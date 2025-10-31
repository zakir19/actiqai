import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { CallEndedEvent, CallTranscriptionReadyEvent, CallSessionParticipantLeftEvent, CallRecordingReadyEvent, CallSessionStartedEvent } from "@stream-io/node-sdk";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import { inngest } from "@/inngest/client";
import { connectGeminiToStreamCall } from "@/lib/gemini-realtime";
import { geminiSessionManager } from "@/lib/gemini-session-manager";
import { audioStreamManager } from "@/lib/audio-stream-manager";

function verifySignatureWithSDK(body: string, signature: string): boolean {
    return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");

    if (!signature || !apiKey) {
        return NextResponse.json({ error: "Missing signature or API key" }, { status: 400 });
    }

    const body = await req.text();

    if (!verifySignatureWithSDK(body, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: unknown;
    try {
        payload = JSON.parse(body) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const eventType = (payload as Record<string, unknown>)?.type;

    if (eventType === "call.session_started") {
        const event = payload as CallSessionStartedEvent;
        const meetingId = event.call.custom?.meetingId;

        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        }

        const [existingMeeting] = await db
            .select()
            .from(meetings)
            .where(and(eq(meetings.id, meetingId), not(eq(meetings.status, "completed")), not(eq(meetings.status, "active")), not(eq(meetings.status, "cancelled")), not(eq(meetings.status, "processing"))));

        if (!existingMeeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        await db.update(meetings).set({ status: "active", startedAt: new Date() }).where(eq(meetings.id, existingMeeting.id));

        const [existingAgent] = await db.select().from(agents).where(eq(agents.id, existingMeeting.agentId));

        if (!existingAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Get the call instance
        const call = streamVideo.video.call("default", meetingId);

        // Add AI agent as a participant to the call
        try {
            await streamVideo.upsertUsers([
                {
                    id: existingAgent.id,
                    name: existingAgent.name,
                    role: "user",
                    image: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${existingAgent.name}`,
                    custom: {
                        isAgent: true,
                        agentType: "gemini"
                    }
                }
            ]);

            // Generate token for the AI agent
            const agentToken = streamVideo.generateUserToken({
                user_id: existingAgent.id,
                exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
            });

            console.log("✅ AI Agent user created:", existingAgent.name);
            console.log("🔑 Agent token generated:", agentToken.substring(0, 20) + "...");

            // Update call metadata to mark agent as joined
            await call.update({
                custom: {
                    ...event.call.custom,
                    agentJoined: true,
                    agentId: existingAgent.id,
                    agentName: existingAgent.name,
                    agentToken: agentToken // Store token in metadata
                }
            });

            console.log("📋 Call metadata updated with agent info");

            // Note: For the agent to appear as an active participant in the call,
            // we would need to establish a WebRTC connection from the server.
            // Currently, the agent will appear in the participant list via custom metadata,
            // but won't have an active video/audio stream until we implement
            // server-side WebRTC or use Stream.io's egress features.

            console.log("🤖 AI Agent registered for call:", meetingId);
        } catch (error) {
            console.error("Error adding AI agent to call:", error);
        }

        // Connect Gemini Multimodal Live API for real-time voice agent
        try {
            const geminiClient = await connectGeminiToStreamCall(
                meetingId,
                existingAgent.id,
                existingAgent.instructions
            );
            
            // Set up audio callback to capture Gemini's audio responses
            geminiClient.onAudioReceived((audioData) => {
                console.log("🔊 Storing Gemini audio for meeting:", meetingId, audioData.length, "bytes");
                audioStreamManager.addGeminiAudio(meetingId, audioData);
            });
            
            // Set up text callback to log Gemini's text responses
            geminiClient.onTextReceived((text) => {
                console.log("💬 Gemini text for meeting:", meetingId, "-", text);
            });
            
            // Store the session for later management
            geminiSessionManager.setSession(meetingId, geminiClient);
            
            console.log("🎙️ Gemini real-time voice agent connected successfully");
        } catch (error) {
            console.error("Error connecting Gemini real-time agent:", error);
            // Continue without voice agent rather than failing the entire meeting
        }
        
    } else if (eventType === "call.session_participant_left") {
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1];

        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        }

        // Disconnect Gemini session
        await geminiSessionManager.endSession(meetingId);

        const call = streamVideo.video.call("default", meetingId);
        await call.end();
    } else if (eventType === "call.session_ended") {
        const event = payload as CallEndedEvent;
        const meetingId = event.call.custom?.meetingId;

        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        }
        
        // Disconnect Gemini session
        await geminiSessionManager.endSession(meetingId);
        
        // Clear audio buffers
        audioStreamManager.clearBuffer(meetingId);
        
        await db
            .update(meetings)
            .set({
                status: "processing",
                endedAt: new Date(),
            })
            .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));
    } else if (eventType === "call.transcription_ready") {
        const event = payload as CallTranscriptionReadyEvent;
        const meetingId = event.call_cid.split(":")[1];

        const [updatedMeeting] = await db
            .update(meetings)
            .set({
                transcriptUrl: event.call_transcription.url,
            })
            .where(eq(meetings.id, meetingId))
            .returning();

        if (!updatedMeeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        await inngest.send({
            name: "meetings/processing",
            data: {
                meetingId: updatedMeeting.id,
                transcriptUrl: updatedMeeting.transcriptUrl,
            },
        });
    } else if (eventType === "call.recording_ready") {
        const event = payload as CallRecordingReadyEvent;
        const meetingId = event.call_cid.split(":")[1];

        await db
            .update(meetings)
            .set({
                recordingUrl: event.call_recording.url,
            })
            .where(eq(meetings.id, meetingId));
    }

    return NextResponse.json({ status: "ok" });
}