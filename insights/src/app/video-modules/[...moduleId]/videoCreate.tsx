"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Transcript from "@/components/Transcript";
import AiNotes from "@/components/AiNotes";
import AiChat from "@/components/AiChat";
import QuizCard from "@/components/QuizzCard";
import { VideoSidebar } from "@/components/VideoSidebar";
import { Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Mynotes from "@/components/Mynotes";

interface Video {
  id: string;
  name: string | null;
  url: string;
  videoId: string;
  summary: string | null;
}

interface Module {
  id: string;
  name: string | null;
  videos: Video[];
}

function VideoLearningContent({
  courseId,
  module,
  currentVideoIndex,
}: {
  courseId: string;
  module: Module;
  currentVideoIndex: number;
}) {
  const [leftTab, setLeftTab] = useState("transcript");
  const [rightTab, setRightTab] = useState("notes");
  const router = useRouter();

  const currentVideo = module.videos[currentVideoIndex];

  const handlePrevious = () => {
    if (currentVideoIndex > 0) {
      const previousVideoId = module.videos[currentVideoIndex - 1].videoId;
      router.push(`/video-modules/${courseId}/${previousVideoId}`);
    }
  };

  const handleNext = () => {
    if (currentVideoIndex < module.videos.length - 1) {
      const nextVideoId = module.videos[currentVideoIndex + 1].videoId;
      router.push(`/video-modules/${courseId}/${nextVideoId}`);
    }
  };

  const [leftSectionWidth, setLeftSectionWidth] = useState(60);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  useEffect(() => {
    const handleDrag = (e: MouseEvent) => {
      if (isDragging) {
        const container = document.getElementById("split-container");
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
          const clampedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
          setLeftSectionWidth(clampedWidth);
        }
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [isDragging]);

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">
      <Header moduleId={module.name || "name"} videoTitle={currentVideo.name || "Untitled Video"} courseId={module.id} videoId={currentVideo.id} />
      <main
        className="flex flex-1 overflow-hidden"
        id="split-container"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {/* Left section - Video and Transcript */}
        <div
          className="w-full lg:w-auto flex flex-col h-full border-r border-gray-200 dark:border-gray-700"
          style={{ flex: `0 0 ${leftSectionWidth}%` }}
        >
          <div className="relative h-[400px] bg-black overflow-hidden transition-all duration-300 hover:shadow-lg">
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.videoId}`}
              title={currentVideo.name || "YouTube Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-gray-800">
            <Tabs defaultValue={leftTab} onValueChange={setLeftTab} className="flex flex-col h-full">
              <TabsList className="w-full justify-start border-b mt-2 border-gray-200 dark:border-gray-700 rounded-none bg-white dark:bg-gray-800">
                <Button
                  onClick={handlePrevious}
                  disabled={currentVideoIndex === 0}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </Button>
                <TabsTrigger
                  value="transcript"
                  className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500 dark:data-[state=active]:text-blue-300 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-300"
                >
                  Transcript
                </TabsTrigger>
                <TabsTrigger
                  value="Mynote"
                  className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500 dark:data-[state=active]:text-blue-300 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-300"
                >
                  My Notes
                </TabsTrigger>
                <Button
                  onClick={handleNext}
                  disabled={currentVideoIndex === module.videos.length - 1}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </Button>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="transcript" className="h-full p-0 m-0">
                  <ScrollArea className="h-full">
                    <div className="p-3">
                      <Transcript moduleId={courseId} videoId={currentVideo.videoId} />
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="Mynote" className="h-full p-0 m-0">
                  <ScrollArea className="h-full">
                    <div className="p-3 h-full">
                      <Mynotes moduleId={courseId} videoId={currentVideo.videoId} />
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Drag handle */}
        <div
          className="hidden lg:block w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500/50 dark:hover:bg-blue-300/50 cursor-col-resize relative transition-all duration-200"
          onMouseDown={handleDragStart}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-1 bg-blue-500/50 dark:bg-blue-300/50 rounded-full transition-transform duration-200 hover:scale-110"></div>
          </div>
        </div>

        {/* Right section - AI Notes, AI Chat, and Quiz */}
        <div
          className="w-full lg:w-auto flex flex-col h-full overflow-hidden bg-white dark:bg-gray-800"
          style={{ flex: `0 0 ${100 - leftSectionWidth - 0.25}%` }}
        >
          <Tabs defaultValue={rightTab} onValueChange={setRightTab} className="flex flex-col h-full">
            <TabsList className="w-full justify-start border-b border-gray-200 dark:border-gray-700 rounded-none bg-white dark:bg-gray-800">
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500 dark:data-[state=active]:text-blue-300 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-300"
              >
                AI Notes
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500 dark:data-[state=active]:text-blue-300 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-300"
              >
                AI Chat
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500 dark:data-[state=active]:text-blue-300 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-300"
              >
                Quiz
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="notes" className="h-full p-0 m-0">
                <ScrollArea className="h-full">
                  <div className="p-3">
                    <AiNotes moduleId={courseId} videoId={currentVideo.videoId} />
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="chat" className="h-full p-0 m-0">
                <ScrollArea className="h-full">
                  <div className="p-3">
                    <AiChat type="video" moduleId={courseId} videoId={currentVideo.videoId} />
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="quiz" className="h-full p-0 m-0">
                <ScrollArea className="h-full">
                  <div className="p-3">
                    <QuizCard videoId={currentVideo.videoId} />
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default function VideoLearningPageClient({
  courseId,
  module,
  currentVideoIndex,
}: {
  courseId: string;
  module: Module;
  currentVideoIndex: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-foreground">
        <VideoSidebar
          courseId={courseId}
          videoId={module.videos[currentVideoIndex].videoId}
          videos={module.videos}
        />
        <VideoLearningContent
          courseId={courseId}
          module={module}
          currentVideoIndex={currentVideoIndex}
        />
      </div>
    </SidebarProvider>
  );
}