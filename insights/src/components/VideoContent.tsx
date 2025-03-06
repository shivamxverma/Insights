"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Define the shape of a video
interface Video {
  id: string;
  name: string | null;
  url: string;
  videoId: string;
  summary: string | null;
}

interface VideoContentProps {
  courseId: string;
  video: Video;
}

export default function VideoContent({ courseId, video }: VideoContentProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Simulated AI notes, chat, highlights, and key insights (replace with actual API calls)
  const [aiNotes, setAiNotes] = useState<string>(video.summary || "Loading AI notes...");
  const [chatMessages, setChatMessages] = useState<string[]>([
    "How can I apply this to my life?",
    "What’s the main takeaway?",
  ]);
  const [highlights, setHighlights] = useState<string[]>([
    "Personal Transformation: Graham Weaver shares his journey from a corporate job to teaching.",
    "The Runner’s High: Weaver discusses the importance of listening to one’s inner truth.",
    "The Nail Metaphor: He uses an analogy to illustrate barriers to fulfillment.",
  ]);
  const [keyInsights, setKeyInsights] = useState<string[]>([
    "The Inner Conflict: The battle between fear and intuition is universal.",
    "Energy vs. Passion: Pursue what energizes you instead of a singular passion.",
  ]);

  // Toggle dark/light mode
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Simulate fetching or generating AI notes (replace with real API logic)
  useEffect(() => {
    // Here, you would call an API to fetch or generate AI notes, chat responses, etc.
    // For now, use the video summary as a placeholder
    if (video.summary) {
      setAiNotes(video.summary);
    } else {
      toast.info("No summary available for this video.");
    }
  }, [video.summary]);

  return (
    <div
      className={cn(
        "flex-1 p-4 overflow-y-auto",
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{video.name || "Untitled Video"}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleTheme}
            className={cn(
              "text-sm",
              isDarkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-900"
            )}
          >
            {isDarkMode ? "Light" : "Dark"}
          </Button>
          <Button variant="outline" className="text-sm">
            Share
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="ghost"
          className={cn(
            "text-sm px-2 py-1",
            isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
          )}
        >
          Detail
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "text-sm px-2 py-1",
            isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
          )}
        >
          AI Notes
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "text-sm px-2 py-1",
            isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
          )}
        >
          AI Chat
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "text-sm px-2 py-1",
            isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
          )}
        >
          Summarize
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* YouTube Video Player */}
        <div className="relative h-[400px] bg-black rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.name || "YouTube Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>

        {/* AI Notes, Highlights, and Insights */}
        <div className="space-y-4">
          {/* AI Notes */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-semibold mb-2">AI Notes</h2>
            <p className="text-sm">{aiNotes}</p>
          </div>

          {/* AI Chat */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-semibold mb-2">AI Chat</h2>
            <div className="space-y-2">
              {chatMessages.map((message, index) => (
                <p key={index} className="text-sm">
                  {message}
                </p>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-semibold mb-2">Highlights</h2>
            <ul className="list-disc list-inside text-sm space-y-1">
              {highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>

          {/* Key Insights */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-semibold mb-2">Key Insights</h2>
            <ul className="list-disc list-inside text-sm space-y-1">
              {keyInsights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}