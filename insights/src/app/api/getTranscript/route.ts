import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { prisma } from "@/lib/db";

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptResponse {
  transcript: TranscriptSegment[];
}

interface ErrorResponse {
  error: string;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const moduleId = url.searchParams.get("moduleId");
  const videoId = url.searchParams.get("videoId");

  if (!moduleId || !videoId) {
    return NextResponse.json(
      { error: "moduleId and videoId are required" } as ErrorResponse,
      { status: 400 }
    );
  }

  try {
    // Check database for existing transcript
    const video = await prisma.video.findFirst({
      where: {
        moduleId,
        videoId,
      },
    });

    if (video?.summary) {
      try {
        const storedTranscript: TranscriptSegment[] = JSON.parse(video.summary);
        return NextResponse.json({ transcript: storedTranscript } as TranscriptResponse);
      } catch (e) {
        console.error("Error parsing stored transcript:", e);
        // Continue to fetch new transcript
      }
    }

    // Fetch transcript from YouTube
    const transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en", // Default to English
    }).catch(async () => {
      // Try alternative languages if English fails
      try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) throw new Error("YOUTUBE_API_KEY is not configured");

        // Get video details to determine language
        const videoDetailsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
        );
        
        if (!videoDetailsRes.ok) {
          throw new Error("Failed to get video details");
        }
        
        const videoDetails = await videoDetailsRes.json();
        const snippet = videoDetails.items?.[0]?.snippet;
        const detectedLanguage = snippet?.defaultAudioLanguage || snippet?.defaultLanguage;
        
        if (detectedLanguage && detectedLanguage !== "en") {
          return await YoutubeTranscript.fetchTranscript(videoId, {
            lang: detectedLanguage,
          });
        }
      } catch (error) {
        console.error("Error detecting language:", error);
      }
      
      throw new Error("No transcript available for this video");
    });

    // Clean transcript data
    const cleanedTranscript = transcript_arr.map((segment: any) => ({
      text: segment.text.trim(),
      start: segment.offset || segment.start,
      duration: segment.duration
    }));

    // Store transcript in database
    await prisma.video.upsert({
      where: { 
        unique_module_video: {
          moduleId,
          videoId
        }
      },
      update: { summary: JSON.stringify(cleanedTranscript) },
      create: {
        videoId,
        moduleId,
        summary: JSON.stringify(cleanedTranscript),
        url: `https://www.youtube.com/watch?v=${videoId}`,
      },
    });

    return NextResponse.json({ transcript: cleanedTranscript } as TranscriptResponse);
  } catch (error) {
    console.error("Error fetching transcript:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch transcript";
    
    return NextResponse.json(
      { error: errorMessage } as ErrorResponse,
      { status: 500 }
    );
  }
}