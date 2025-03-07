"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/(protected)/app-sidebar";
import Transcript from "@/components/Transcript";
import AiNotes from "@/components/AiNotes";
import AiChat from "@/components/AiChat";
import { VideoSidebar } from "@/components/VideoSidebar";
import { Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

// Child component to ensure useSidebar is called within SidebarProvider
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
  const { theme } = useTheme();
  const router = useRouter();
  const { state: sidebarState } = useSidebar(); // Now safely called within SidebarProvider

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
  }, [isDragging, handleDragEnd]);

  return (
    <div className="h-176">
      <Header videoTitle={currentVideo.name || "Untitled Video"} lecturer="Graham Weaver" />
      <main
        className="flex flex-1 overflow-hidden"
        id="split-container"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {/* Left section - Video and Transcript */}
        <div
          className="w-full lg:w-auto flex flex-col h-full border-r border-border"
          style={{ flex: `0 0 ${leftSectionWidth}%` }}
        >
          {/* YouTube Video Player */}
          <div className="relative h-[400px] bg-black overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.videoId}`}
              title={currentVideo.name || "YouTube Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>

          {/* Tabs and Transcript */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <Tabs defaultValue={leftTab} onValueChange={setLeftTab} className="flex flex-col h-full">
              <TabsList className="w-full justify-start border-b mt-2 border-border rounded-none bg-background">
                <Button
                  onClick={handlePrevious}
                  disabled={currentVideoIndex === 0}
                  variant="outline"
                >
                  ← Previous
                </Button>
                <TabsTrigger value="transcript" className="data-[state=active]:bg-primary/10">
                  Transcript
                </TabsTrigger>
                <TabsTrigger value="discover" className="data-[state=active]:bg-primary/10">
                  MyNotes
                </TabsTrigger>
                <Button
                  onClick={handleNext}
                  disabled={currentVideoIndex === module.videos.length - 1}
                  variant="outline"
                >
                  Next →
                </Button>
              </TabsList>
            
            <ScrollArea className="h-72">
              <TabsContent value="transcript" className="flex-1 overflow-hidden p-0 m-0">
                <div className="h-full overflow-y-auto p-3">
                  <Transcript moduleId={courseId} videoId={currentVideo.videoId} />
                </div>
              </TabsContent>
            </ScrollArea>

            
              <TabsContent value="discover" className="flex-1 overflow-auto p-4">
                <div className="text-sm">
                  <h3 className="text-lg font-semibold mb-2">Discover related content</h3>
                  <p>Explore more videos and resources related to this topic.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Drag handle */}
        <div
          className="hidden lg:block w-1 bg-border hover:bg-primary/50 cursor-col-resize relative"
          onMouseDown={handleDragStart}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-1 bg-primary/50 rounded-full"></div>
          </div>
        </div>

        {/* Right section - AI Notes and Chat */}
        <div
          className="w-full lg:w-auto flex flex-col h-full overflow-hidden"
          style={{ flex: `0 0 ${100 - leftSectionWidth - 0.25}%` }}
        >
          <Tabs defaultValue={rightTab} onValueChange={setRightTab} className="flex flex-col h-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-background">
              <TabsTrigger value="notes" className="data-[state=active]:bg-primary/10">
                AI Notes
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-primary/10">
                AI Chat
              </TabsTrigger>
            </TabsList>

            {/* <Transcript moduleId="cm7w82quc0005757y5a19qmz9" videoId="FoQR9rLpRy8" ></Transcript>
            <AiNote moduleId="cm7w82quc0005757y5a19qmz9" videoId="FoQR9rLpRy8" ></AiNote> */}
            <ScrollArea className="h-172">
            <TabsContent value="notes" className="flex-1 overflow-hidden p-0 m-0">
              <div className="h-full overflow-y-auto p-3">
              <AiNotes moduleId={courseId} videoId={currentVideo.videoId} />
              </div>
            </TabsContent>
            </ScrollArea >

            <ScrollArea className="h-172">
            <TabsContent value="chat" className="flex-1 overflow-hidden p-0 m-0">
              <div className="h-full overflow-y-auto p-3">
                <AiChat videoId={currentVideo.videoId} />
              </div>
            </TabsContent>
            </ScrollArea>
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
      <div className="flex min-h-screen bg-background text-foreground">
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