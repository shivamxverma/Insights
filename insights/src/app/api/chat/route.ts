import { NextRequest, NextResponse } from "next/server";
import { retrieveAnswer } from "@/lib/retrieval";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, videoId } = await req.json();
    const userMessage = messages[messages.length - 1]?.content;

    if (!userMessage || !videoId) {
      return NextResponse.json({ error: "User message and videoId are required" }, { status: 400 });
    }

    const answer = await retrieveAnswer(userMessage, videoId);
    
    return NextResponse.json({ role: "assistant", content: answer });

  } catch (error) {
    // console.error("Error in chat API:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
