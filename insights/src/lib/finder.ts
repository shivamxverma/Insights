'use server'
import { prisma } from "@/lib/db";
import { generateSummary } from "@/lib/gemini";

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptProps {
  moduleId: string;
  videoId: string;
}

export async function findGeneratedSummary({ moduleId, videoId }: TranscriptProps): Promise<string | null> {
  try {
    // Find the video in the database
    const video = await prisma.video.findFirst({
      where: {
        moduleId,
        videoId,
      },
    });

    // If the video has a generated summary, return it
    if (video?.generatedSummary) {
      return video.generatedSummary;
    }

    // If the video has a transcript in the summary field, use it
    if (video?.summary) {
      const transcript: TranscriptSegment[] = JSON.parse(video.summary);
      const transcriptText = transcript.map((seg) => seg.text).join(" ");
      if (!transcriptText.trim()) {
        console.warn("Transcript is empty, cannot generate summary");
        return null;
      }

      const summary = await generateSummary(transcriptText);
      await prisma.video.update({
        where: {
          moduleId_videoId: {
            moduleId,
            videoId,
          },
        },
        data: {
          generatedSummary: summary,
        },
      });
      return summary;
    }

    // Fetch transcript from API if no summary exists
    const res = await fetch(`/api/getTranscript?moduleId=${moduleId}&videoId=${videoId}`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch transcript");
    }

    const data = await res.json();
    console.log("Transcript data from API:", data);

    const transcript: TranscriptSegment[] = Array.isArray(data.transcript)
      ? data.transcript
      : JSON.parse(data.transcript || "[]");
    const transcriptText = transcript.map((seg) => seg.text).join(" ");

    if (!transcriptText.trim()) {
      console.warn("Fetched transcript is empty, cannot generate summary");
      return null;
    }

    const summary = await generateSummary(transcriptText);
    await prisma.video.update({
      where: {
        moduleId_videoId: {
          moduleId,
          videoId,
        },
      },
      data: {
        generatedSummary: summary,
      },
    });

    return summary;
  } catch (error) {
    console.error("Error in findGeneratedSummary:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate summary");
  }
}