"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import Link from "next/link";
// import { deleteModule } from "@/lib/videoAction";

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
      toast("Video or playlist added to module",);
      queryClient.invalidateQueries({ queryKey: ['modules', userId] });
      router.push(`/video-modules/${module.id}/${videoId}`);
    },
    onError: (error: any) => {
      console.error(error);
      toast(
       "Failed to add video or playlist to module",
    );
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
      toast("Please select a module or choose to create a new one",);
      return;
    }

    if (action === "new" && !moduleName.trim()) {
      toast("Please enter a module name");
      return;
    }

    addToModule();
  };

  const { videoId, playlistId } = getYouTubeIds(url);
  // console.log("videoId:", videoId, "playlistId:", playlistId);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Video Module</h1>
      <Input
        type="text"
        placeholder="Enter a YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="mb-4"
      />

      {url && (videoId || playlistId) ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="single"
                checked={action === "single"}
                onChange={() => setAction("single")}
                className="text-blue-600 focus:ring-blue-500"
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
                  className="text-blue-600 focus:ring-blue-500"
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
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Create new module</span>
            </label>
          </div>

          {action === "new" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Module Name:
              </label>
              <Input
                type="text"
                placeholder="Enter the module name"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {action !== "new" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Module:
              </label>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-neutral-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <Button
            type="submit"
            disabled={isAddingPending || (!moduleId && action !== "new")}
            className="w-full"
          >
            {isAddingPending ? "Submitting..." : "Submit"}
          </Button>
        </form>
      ) : (
        <p className="text-muted-foreground">
          Please enter a valid YouTube URL to proceed.
        </p>
      )}

      {/* Module List at the Bottom */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Modules</h2>
        {modules.length > 0 ? (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-2 bg-gray-100 dark:bg-neutral-800 rounded-md"
                >
                  <Link
                    href={`/video-modules/${module.id}`}
                    className="text-sm font-medium truncate flex-1 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {module.name}
                  </Link>
                
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground">No modules created yet.</p>
        )}
      </div>
    </div>
  );
}