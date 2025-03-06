"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

// Define the shape of a video (based on your Prisma schema)
interface Video {
  id: string;
  name: string | null; // Nullable in schema
  url: string;
  videoId: string;
  summary: string | null;
}

// Props interface for the component
interface VideoSidebarProps {
  courseId: string; // This is the moduleId
  videoId: string; // Current video ID for highlighting
  videos: Video[]; // Array of Video objects
}

export function VideoSidebar({ courseId, videoId, videos }: VideoSidebarProps) {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  // Function to determine if the current path matches the video link
  const isActive = (videoVideoId: string) =>
    pathname === `/video-modules/${courseId}/${videoVideoId}`;

  return (
    <Sidebar collapsible="icon" variant="floating" className="h-full">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          {open && (
            <h1 className="text-2xl font-extrabold text-primary/90 tracking-wide leading-tight drop-shadow-md">
              <Link href={`/dashboard`}>Insights</Link>
            </h1>
          )}
          {!open && (
            <span className="sr-only">Toggle Sidebar</span> 
          )}
        </div>
      </SidebarHeader>

      <Button
        className="w-full flex items-center gap-2 p-2 mt-2 mb-4 transition-colors duration-200 hover:bg-primary hover:text-white"
        variant="outline"
        onClick={() => window.location.href = "/yt-video"}
        aria-label={open ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        <LayoutDashboard className="h-4 w-4" />
        {open && <span>Yt-video</span>}
      </Button>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {videos.map((video) => (
                <SidebarMenuItem key={video.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`/video-modules/${courseId}/${video.videoId}`} // Use videoId for URL consistency
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ease-in-out",
                        isActive(video.videoId)
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-gray-100 text-foreground"
                      )}
                      aria-label={`Go to ${video.name || "Untitled Video"}`}
                    >
                      <Play className="h-4 w-4" />
                      <span className="truncate flex-1">{video.name || "Untitled Video"}</span>
                      {isActive(video.videoId) && open && (
                        <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Button
        className="w-full flex items-center gap-2 p-2 transition-colors duration-200 hover:bg-primary hover:text-white"
        variant="outline"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", open ? "" : "rotate-180")} />
        {open && <span>{open ? "Collapse" : "Expand"}</span>}
      </Button>
    </Sidebar>
  );
}