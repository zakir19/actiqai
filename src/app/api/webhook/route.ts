import { streamVideo } from "@/lib/stream-video";
import { startGeminiAgent } from "@/lib/gemini-agent";
import { db } from "@/db"; // Assuming you have a DB setup
import { agents } from "@/db/schema"; // Assuming a schema
import { eq } from "drizzle-orm";
import { trpc } from "@/trpc/server"; // Import your tRPC server helper

// This assumes you have a tRPC caller setup, if not, you can call the API
// This example will use a direct DB lookup for simplicity.

export async function POST(req: Request) {
  const body = await req.json();
  const event = streamVideo.readEvent(req.headers, body);

  if (event.type === "call.created") {
    console.log(`Call created: ${event.call_cid}`);
    const callId = event.call.id;
    
    // Example: Find the agent associated with this meeting
    // You would customize this logic based on your app
    // For this example, let's find an agent named "ActiqAI Assistant"
    const existingAgent = await db.query.agents.findFirst({
        where: eq(agents.name, "ActiqAI Assistant"),
    });

    if (existingAgent) {
      // 1. Get a token for the agent using our new tRPC logic
      // This is a simplified way to call your tRPC procedure from the server
      const { token } = await trpc.ai.getAgentToken.mutate({
        agentId: existingAgent.id,
        agentName: existingAgent.name,
      });

      // 2. Start the agent
      await startGeminiAgent({
        callId: callId,
        agentToken: token,
        agentId: existingAgent.id,
        agentName: existingAgent.name,
        agentInstructions: existingAgent.instructions,
      });
    } else {
      console.warn("No default agent found for the call.");
    }
  }

  return new Response("Webhook processed", { status: 200 });
}