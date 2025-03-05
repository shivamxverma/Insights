import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";

export async function getTranscript(videoId: string): Promise<string> {
    try {
      const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
      if (!transcriptArr || transcriptArr.length === 0) throw new Error("No transcript available");
      return transcriptArr.map(t => t.text).join(" ").replaceAll("\n", "").trim();
    } catch (error) {
      console.log(`Transcript fetch failed for ${videoId}:`, error);
      const details = await fetchVideoDetails(videoId);
      return details?.description.slice(0, 500) + (details?.description.length > 500 ? "..." : "") || "";
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