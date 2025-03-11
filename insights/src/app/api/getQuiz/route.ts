// app/api/getQuiz/route.ts
import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { generateQuestions } from "@/lib/gemini";
import { prisma } from "@/lib/db";


export async function POST(req: NextRequest) {
  const { videoId } = await req.json();

  console.log("Received videoId:", videoId); // Debug log

  if (!videoId) {
    return NextResponse.json(
      { error: "videoId (YouTube ID) is required" },
      { status: 400 }
    );
  }

  try {
    const video = await prisma.video.findFirst({
      where: { videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found in database" },
        { status: 404 }
      );
    }

    const existingQuizzes = await prisma.quiz.findMany({
      where: { videoId: video.id },
      take: 5,
    });

    if (existingQuizzes.length >= 5) {
      return NextResponse.json({ questions: existingQuizzes }, { status: 200 });
    }
    const transcript = await prisma.video.findFirst({
      where: { videoId: videoId },
      select: { summary: true },
    });
    console.log("Fetched transcript:", transcript); // Debug log

    const generatedQuestions = await generateQuestions(transcript?.summary!, "Video Quiz");
    console.log("Generated questions:", generatedQuestions); // Debug log

    await prisma.quiz.deleteMany({
      where: { videoId: video.id },
    });

    interface GeneratedQuestion {
      question: string;
      answer: string;
      options: string[];
    }

    interface QuizCreationData {
      videoId: string;
      question: string;
      answer: string;
      options: string;
    }

    await prisma.quiz.createMany({
      data: generatedQuestions.map((q: GeneratedQuestion): QuizCreationData => ({
        videoId: video.id,
        question: q.question,
        answer: q.answer,
        options: JSON.stringify(q.options),
      })),
    });

    const quizzes = await prisma.quiz.findMany({
      where: { videoId: video.id },
      take: 5,
    });

    return NextResponse.json({ questions: quizzes }, { status: 201 });
  } catch (error) {
    console.error("Quiz Creation Error:", error);
    return NextResponse.json({ error: "Failed to generate quizzes" }, { status: 500 });
  }
}