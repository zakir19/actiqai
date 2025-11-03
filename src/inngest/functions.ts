import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { StreamTranscriptItem } from "@/modules/meetings/types";
import { eq, inArray } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

import JSONL from "jsonl-parse-stringify";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const SUMMARIZER_SYSTEM_PROMPT = `You are an expert summarizer. You write readable, concise, simple content. You are given a transcript of a meeting and you need to summarize it.

Use the following markdown structure for every output:

### Overview
Provide a detailed, engaging summary of the session's content. Focus on major features, user workflows, and any key takeaways. Write in a narrative style, using full sentences. Highlight unique or powerful aspects of the product, platform, or discussion.

### Notes
Break down key content into thematic sections with timestamp ranges. Each section should summarize key points, actions, or demos in bullet format.

Example:
#### Section Name
- Main point or demo shown here
- Another key insight or interaction
- Follow-up tool or explanation provided

#### Next Section
- Feature X automatically does Y
- Mention of integration with Z`.trim();

export const meetingsProcessing = inngest.createFunction(
    { id: "meetings/processing" },
    { event: "meetings/processing" },

    async ({ event, step }) => {
        // Check if this is a LiveKit meeting (has transcript) or Stream meeting (has transcriptUrl)
        const isLiveKitMeeting = !event.data.transcriptUrl && event.data.meetingId;
        
        let transcriptWithSpeakers;

        if (isLiveKitMeeting) {
            // LiveKit meeting: Get transcript from database
            transcriptWithSpeakers = await step.run("fetch-livekit-transcript", async () => {
                const [meeting] = await db
                    .select()
                    .from(meetings)
                    .where(eq(meetings.id, event.data.meetingId));

                if (!meeting || !meeting.transcript) {
                    console.error("[Inngest] No transcript found for meeting:", event.data.meetingId);
                    return [];
                }

                try {
                    const transcript = JSON.parse(meeting.transcript);
                    return transcript.map((entry: { speaker: string; text: string; timestamp: string }) => ({
                        speaker_id: entry.speaker === "User" ? meeting.userId : meeting.agentId,
                        text: entry.text,
                        timestamp: entry.timestamp,
                        user: {
                            name: entry.speaker,
                        },
                    }));
                } catch (e) {
                    console.error("[Inngest] Failed to parse transcript:", e);
                    return [];
                }
            });
        } else {
            // Stream.io meeting: Use existing flow
            const response = await step.run("fetch-transcript", async () => {
                return fetch(event.data.transcriptUrl).then((res) => res.text());
            });
            
            const transcript = await step.run("parse-transcript", async () => {
                return JSONL.parse<StreamTranscriptItem>(response);
            });

            transcriptWithSpeakers = await step.run("add-speakers", async () => {
                const speakerIds = [...new Set(transcript.map((item) => item.speaker_id))];

                const userSpeakers = await db
                    .select()
                    .from(user)
                    .where(inArray(user.id, speakerIds))
                    .then((users) =>
                        users.map((user) => ({
                            ...user,
                        }))
                    );

                const agentSpeakers = await db
                    .select()
                    .from(agents)
                    .where(inArray(agents.id, speakerIds))
                    .then((agents) => agents.map((agent) => ({ ...agent })));

                const speakers = [...userSpeakers, ...agentSpeakers];

                return transcript.map((item) => {
                    const speaker = speakers.find((speaker) => speaker.id === item.speaker_id);

                    if (!speaker) {
                        return {
                            ...item,
                            user: {
                                name: "Unknown",
                            },
                        };
                    }

                    return {
                        ...item,
                        user: {
                            name: speaker.name,
                        },
                    };
                });
            });
        }

        const summary = await step.run("generate-summary", async () => {
            if (!transcriptWithSpeakers || transcriptWithSpeakers.length === 0) {
                return "## No Conversation\n\nThis meeting ended without any recorded conversation. The meeting was started but no dialogue was captured.";
            }

            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash-exp",
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.9,
                },
            });
            
            const result = await model.generateContent([
                { text: SUMMARIZER_SYSTEM_PROMPT },
                { text: "Summarize the following transcript:\n\n" + JSON.stringify(transcriptWithSpeakers, null, 2) }
            ]);
            
            return result.response.text();
        });

        await step.run("save-summary", async () => {
            await db
                .update(meetings)
                .set({
                    summary: summary,
                    status: "completed",
                })
                .where(eq(meetings.id, event.data.meetingId));
        });
    }
);
