"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";
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
}

// Props interface for the component
interface VideoSidebarProps {
  courseId: string; // This is the moduleId
  videoId: string; // Current video ID for highlighting
  videos: string; // List of videos in the module
}

export function VideoSidebar({ courseId, videoId, videos }: VideoSidebarProps) {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          {open && (
            <h1 className="text-2xl font-extrabold text-primary/90 tracking-wide leading-tight drop-shadow-md">
              <Link href="/">Insights</Link>
            </h1>
          )}
        </div>
      </SidebarHeader>

      <Button className="mt-4 w-full flex items-center gap-2" variant="outline" onClick={() => setOpen(!open)}>
        <Link href="/yt-video">YT-video</Link>
      </Button>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {videos.map((video) => (
                <SidebarMenuItem key={video.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`/video-modules/${courseId}/${video.id}`}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ease-in-out",
                        pathname === `/video-modules/${courseId}/${video.id}`
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-gray-100"
                      )}
                    >
                      <span>{video.name || "Untitled Video"}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Button
        className="w-full flex items-center gap-2 transition-colors duration-200 hover:bg-primary hover:text-white"
        variant="outline"
        onClick={() => setOpen(!open)}
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", open ? "" : "rotate-180")} />
      </Button>
    </Sidebar>
  );
}