// lib/youtube.ts
import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";

export async function getTranscript(videoId: string): Promise<{ text: string; start: number; duration: number }[]> {
  try {
    const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    if (!transcriptArr || transcriptArr.length === 0) throw new Error("No transcript available");

    // Map and validate the transcript data
    return transcriptArr.map((t) => ({
      text: t.text?.trim() || "",
      start: typeof t.offset === "number" ? t.offset / 1000 : 0, // Default to 0 if invalid, convert ms to seconds
      duration: typeof t.duration === "number" ? t.duration / 1000 : 0, // Default to 0 if invalid, convert ms to seconds
    }));
  } catch (error) {
    console.log(`Transcript fetch failed for ${videoId}:`, error);
    const details = await fetchVideoDetails(videoId);
    return details?.description ? [{ text: details.description, start: 0, duration: 0 }] : [];
  }
}

async function fetchVideoDetails(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=snippet&id=${videoId}`
    );
    const data = await res.json();
    return data.items?.[0]?.snippet || null;
  } catch (error) {
    console.error("Failed to fetch video details:", error);
    return null;
  }
}