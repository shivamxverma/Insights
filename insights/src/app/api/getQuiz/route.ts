// app/api/getQuiz/route.ts
import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { generateQuestions } from "@/lib/gemini";
import { prisma } from "@/lib/db";

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

async function getTranscript(videoId: string): Promise<string> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error("YOUTUBE_API_KEY is not configured");

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );
    const data = await res.json();
    const snippet = data.items?.[0]?.snippet;
    if (!snippet) throw new Error("Video details not found");

    const detectedLanguage = snippet.defaultAudioLanguage || "en";
    const lang = detectedLanguage === "hi" ? "hi" : "en";

    let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: lang,
    });
    if (transcript_arr.length === 0) {
      console.warn("No valid transcript segments found");
      return "";
    }

    // Concatenate all text without time logic
    const transcript = transcript_arr.map((seg) => seg.text.trim()).join(" ");
    // console.log("Fetched transcript:", transcript); // Debug log
    return transcript.replaceAll("\n", " ").trim();
  } catch (error) {
    console.error("Transcript Error:", error);
    return "";
  }
}

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

    const transcript = await getTranscript(videoId);
    // console.log("Fetched transcript:", transcript); // Debug log
    if (!transcript) {
      return NextResponse.json(
        { error: "No transcript available for this video" },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const videoDetailsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );
    const videoDetails = await videoDetailsRes.json();
    const detectedLanguage = videoDetails.items?.[0]?.snippet.defaultAudioLanguage || "en";
    const isHindi = detectedLanguage === "hi";

    const generatedQuestions = await generateQuestions(transcript, "Video Quiz", isHindi);
    // console.log("Generated questions:", generatedQuestions); // Debug log

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