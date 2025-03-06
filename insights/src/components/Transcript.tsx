"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getTranscript } from "@/lib/youtube";

interface TranscriptItem {
  id: number;
  time: string;
  seconds: number;
  text: string;
}

interface TranscriptProps {
  videoId: string;
}

export default function Transcript({ videoId }: TranscriptProps) {
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);

  // Fetch transcript data
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const transcriptText = await getTranscript(videoId);
        // Split the transcript into chunks (simulating timed segments)
        const words = transcriptText.split(" ");
        const items: TranscriptItem[] = [];
        let currentTime = 0;

        for (let i = 0; i < words.length; i += 10) {
          const chunk = words.slice(i, i + 10).join(" ");
          const minutes = Math.floor(currentTime / 60);
          const seconds = Math.floor(currentTime % 60);
          const time = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

          items.push({
            id: i / 10 + 1,
            time,
            seconds: currentTime,
            text: chunk,
          });

          currentTime += 5; // Increment time by 5 seconds per chunk (adjust as needed)
        }

        setTranscript(items);
      } catch (error) {
        console.error("Failed to fetch transcript:", error);
        setTranscript([]);
      }
    };

    fetchTranscript();
  }, [videoId]);

  // Listen for video time updates
  useEffect(() => {
    const handleVideoTimeUpdate = (event: CustomEvent<{ currentTime: number }>) => {
      setCurrentTime(event.detail.currentTime);
    };

    document.addEventListener("videoTimeUpdate", handleVideoTimeUpdate as EventListener);

    return () => {
      document.removeEventListener("videoTimeUpdate", handleVideoTimeUpdate as EventListener);
    };
  }, []);

  // Update active transcript item based on current video time
  useEffect(() => {
    const activeItem = transcript.find((item, index) => {
      const nextItem = transcript[index + 1];
      return item.seconds <= currentTime && (!nextItem || nextItem.seconds > currentTime);
    });

    if (activeItem) {
      setActiveItemId(activeItem.id);
    }
  }, [currentTime, transcript]);

  // Filter transcript based on search query
  const filteredTranscript = transcript.filter((item) =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Jump to specific time in video
  const jumpToTime = (seconds: number) => {
    setCurrentTime(seconds);
    const videoElement = document.querySelector("iframe");
    if (videoElement) {
      (videoElement as HTMLIFrameElement).contentWindow?.postMessage(
        JSON.stringify({ event: "seekTo", seconds }),
        "*"
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        {filteredTranscript.length > 0 ? (
          filteredTranscript.map((item) => (
            <div
              key={item.id}
              className={`flex gap-3 mb-4 p-2 rounded-md transition-colors ${
                item.id === activeItemId ? "bg-primary/10" : "hover:bg-muted/50"
              }`}
              onClick={() => jumpToTime(item.seconds)}
            >
              <div className="text-sm font-medium text-muted-foreground w-10">{item.time}</div>
              <div className="text-sm flex-1">{item.text}</div>
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-muted-foreground">No transcript entries match your search.</div>
        )}
      </div>
    </div>
  );
}