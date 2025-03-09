import { NextRequest, NextResponse } from "next/server";
import { findGeneratedSummary } from "@/lib/finder";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");
  const videoId = searchParams.get("videoId");

  if (!moduleId || !videoId) {
    return NextResponse.json({ error: "moduleId and videoId are required" }, { status: 400 });
  }

  try {
    const summary = await findGeneratedSummary({ moduleId, videoId });
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}