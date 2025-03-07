// app/api/updateSummary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { moduleId, videoId, generatedSummary } = await req.json();

    if (!moduleId || !videoId || !generatedSummary) {
      return NextResponse.json(
        { error: "moduleId, videoId, and generatedSummary are required" },
        { status: 400 }
      );
    }

    const video = await prisma.video.findFirst({
      where: { moduleId, videoId },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    await prisma.video.update({
      where: { id: video.id },
      data: { generatedSummary },
    });

    return NextResponse.json({ message: "Summary updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating summary:", error);
    return NextResponse.json({ error: "Failed to update summary" }, { status: 500 });
  }
}