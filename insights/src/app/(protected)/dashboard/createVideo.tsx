"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Clock, BookOpen, User, Globe, Subtitles, FileText } from "lucide-react";
import Link from "next/link";

interface Module {
  id: string;
  name: string;
}

interface CreateVideoClientProps {
  userId: string;
  modules: Module[];
}

export default function CreateVideoClient({ userId, modules }: CreateVideoClientProps) {
  const [url, setUrl] = useState("");
  const [action, setAction] = useState<"single" | "playlist" | "new">("single");
  const [moduleId, setModuleId] = useState<string>("");
  const [moduleName, setModuleName] = useState<string>("");
  const router = useRouter();
  const queryClient = useQueryClient();

  // Helper to extract video ID and playlist ID from a YouTube URL
  function getYouTubeIds(youtubeUrl: string): { videoId: string | null; playlistId: string | null } {
    try {
      const urlObj = new URL(youtubeUrl);
      const videoId = urlObj.searchParams.get("v") || null;
      const playlistId = urlObj.searchParams.get("list") || null;
      return { videoId, playlistId };
    } catch {
      return { videoId: null, playlistId: null };
    }
  }

  // Mutation for adding a video or playlist
  const { mutate: addToModule, isPending: isAddingPending } = useMutation({
    mutationFn: async () => {
      const { videoId, playlistId } = getYouTubeIds(url);
      console.log("videoId:", videoId, "playlistId:", playlistId, "moduleId:", moduleId, "action:", action, "moduleName:", moduleName);
      if (!videoId && !playlistId) throw new Error("Invalid YouTube URL");
      if (action === "new" && !moduleName.trim()) throw new Error("Module name is required");

      const response = await axios.post<{ module: { id: string } }>("/api/add-to-module", {
        userId,
        videoId: action === "playlist" ? null : videoId,
        playlistId: action === "playlist" ? playlistId : null,
        moduleId: moduleId || null,
        action: moduleId ? "existing" : action,
        newModuleName: action === "new" ? moduleName : undefined,
      });
      return response.data;
    },
    onSuccess: ({ module }) => {
      toast("Video or playlist added to module");
      queryClient.invalidateQueries({ queryKey: ["modules", userId] });
      router.push(`/video-modules/${module.id}/${videoId}`);
    },
    onError: (error: any) => {
      console.error(error);
      toast("Failed to add video or playlist to module");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { videoId, playlistId } = getYouTubeIds(url);
    console.log("handle videoId:", videoId, "playlistId:", playlistId, "moduleId:", moduleId, "action:", action, "moduleName:", moduleName);

    if (!url || (!videoId && !playlistId)) {
      toast("Please enter a valid YouTube URL");
      return;
    }

    if (!moduleId && action !== "new") {
      toast("Please select a module or choose to create a new one");
      return;
    }

    if (action === "new" && !moduleName.trim()) {
      toast("Please enter a module name");
      return;
    }

    addToModule();
  };

  const { videoId, playlistId } = getYouTubeIds(url);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-3xl w-full">
        {/* Header Section */}
        <h1 className="text-3xl font-bold text-center mb-8">Add a YouTube Video to Your Learning Module</h1>

        {/* URL Input Section */}
        <div className="flex items-center gap-4 mb-8">
          <Input
            type="text"
            placeholder="Enter the YouTube video link, for example: https://www.youtube.com/watch?v=example"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 py-3 text-sm bg-background border-border focus:border-foreground/50"
          />
        </div>

        {/* Form Section */}
        {url && (videoId || playlistId) ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="single"
                    checked={action === "single"}
                    onChange={() => setAction("single")}
                    className="text-foreground focus:ring-foreground/50"
                    disabled={!videoId}
                  />
                  <span>Add only this video</span>
                </label>
                {playlistId && (
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="playlist"
                      checked={action === "playlist"}
                      onChange={() => setAction("playlist")}
                      className="text-foreground focus:ring-foreground/50"
                    />
                    <span>Add entire playlist</span>
                  </label>
                )}
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="new"
                    checked={action === "new"}
                    onChange={() => setAction("new")}
                    className="text-foreground focus:ring-foreground/50"
                  />
                  <span>Create new module</span>
                </label>
              </div>

              {action === "new" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Module Name:</label>
                  <Input
                    type="text"
                    placeholder="Enter the module name"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full py-3 bg-background border-border focus:border-foreground/50"
                  />
                </div>
              )}

              {action !== "new" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Select Module:</label>
                  <select
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    className="w-full px-3 py-3 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/50"
                  >
                    <option value="">-- Select a module --</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isAddingPending || (!moduleId && action !== "new")}
              className="w-full py-3 font-semibold bg-foreground text-background hover:bg-foreground/80"
            >
              {isAddingPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        ) : (
          <p className="text-muted-foreground text-center">Please enter a valid YouTube URL to proceed.</p>
        )}
      </div>

      {/* Feature Showcase Section (Inspired by the Image) */}
      <div className="max-w-5xl w-full mt-12">
        <h2 className="text-2xl font-semibold text-center mb-8">Why Use Insights?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Time-Saving */}
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
            <Clock className="h-8 w-8 mb-4 text-foreground" />
            <h3 className="text-lg font-semibold mb-2">Time-Saving</h3>
            <p className="text-muted-foreground text-sm">
              Get transcriptions and summaries in seconds, quickly decide if you want to continue watching, without any ads.
            </p>
          </div>

          {/* Perfect for Learning */}
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
            <BookOpen className="h-8 w-8 mb-4 text-foreground" />
            <h3 className="text-lg font-semibold mb-2">Perfect for Learning</h3>
            <p className="text-muted-foreground text-sm">
              Helps you understand videos through Highlights, Key Insights, Outline, Core Concepts, FAQs, AI Chat, and more.
            </p>
          </div>

          {/* Personalized for You */}
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
            <User className="h-8 w-8 mb-4 text-foreground" />
            <h3 className="text-lg font-semibold mb-2">Personalized for You</h3>
            <p className="text-muted-foreground text-sm">
              Customize summary prompts, depth, length, tone, and more to fit your needs.
            </p>
          </div>

          {/* 100+ Languages */}
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
            <Globe className="h-8 w-8 mb-4 text-foreground" />
            <h3 className="text-lg font-semibold mb-2">100+ Languages</h3>
            <p className="text-muted-foreground text-sm">
              Transcribe and summarize in over 100 languages, easily access global content.
            </p>
          </div>

          {/* No-Subtitle YouTube */}
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
            <Subtitles className="h-8 w-8 mb-4 text-foreground" />
            <h3 className="text-lg font-semibold mb-2">No-Subtitle YouTube</h3>
            <p className="text-muted-foreground text-sm">
              Transcribe YouTube videos without subtitles (up to 40min), and for videos with subtitles, there’s no length limit.
            </p>
          </div>

          {/* Timestamped Transcripts */}
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
            <FileText className="h-8 w-8 mb-4 text-foreground" />
            <h3 className="text-lg font-semibold mb-2">Timestamped Transcripts</h3>
            <p className="text-muted-foreground text-sm">
              Get the transcripts with timestamps and download subtitles for easy reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}