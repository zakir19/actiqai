import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAIKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { prompt, system } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }
    if (!genAIKey) {
      return NextResponse.json({ error: "missing GOOGLE_API_KEY" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(genAIKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 200,
      },
    });

    // Enhanced system prompt for better responses
    const enhancedSystem = system 
      ? `${system}\n\nIMPORTANT RULES:\n- Answer ONLY what the user asks, be direct and specific\n- NO markdown formatting (no **, __, ##, etc.)\n- NO generic introductions like "I'm here to help"\n- Give the actual answer immediately\n- Keep responses under 3 sentences\n- Be conversational and natural`
      : "You are a helpful AI assistant. Answer questions directly and specifically. No markdown formatting. Keep responses brief and natural.";

    const parts = [] as { text: string }[];
    parts.push({ text: enhancedSystem });
    parts.push({ text: prompt });

    const result = await model.generateContent(parts);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (e) {
    console.error("AI respond error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
