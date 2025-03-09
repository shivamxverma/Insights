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
    const video = await prisma.video.findFirst({
      where: {
        moduleId,
        videoId,
      },
    });

    if (video?.generatedSummary) {
      return video.generatedSummary;
    }

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
          moduleId_videoId: { // Updated to match new schema
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
        moduleId_videoId: { // Updated to match new schema
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
    return null;
  }
}