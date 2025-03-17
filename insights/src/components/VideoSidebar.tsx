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
import Image from "next/image";

interface Video {
  id: string;
  name: string | null;
  url: string;
  videoId: string;
  summary: string | null;
}

interface VideoSidebarProps {
  courseId: string;
  videoId: string;
  videos: Video[];
}

export function VideoSidebar({ courseId, videoId, videos }: VideoSidebarProps) {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  const isActive = (videoVideoId: string) =>
    pathname === `/video-modules/${courseId}/${videoVideoId}`;

  return (
    <Sidebar collapsible="icon" variant="floating" className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
           <Image
                          src="/logo.png"
                          alt="Insights"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
          {open && (
            
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-wide leading-tight drop-shadow-md transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
              <Link href={`/create`}>Insights</Link>
            </h1>
          )}
        </div>
      </SidebarHeader>

      <Button
        className="w-full flex items-center gap-2 p-2 mt-2 mb-4 transition-all duration-200 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white hover:shadow-md"
        variant="outline"
        onClick={() => window.location.href = "/modules"}
        aria-label={open ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        <LayoutDashboard className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        {open && <span className="transition-opacity duration-200 hover:opacity-80">Modules</span>}
      </Button>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {videos.map((video) => (
                <SidebarMenuItem key={video.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`/video-modules/${courseId}/${video.videoId}`}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-all duration-200",
                        isActive(video.videoId)
                          ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm"
                      )}
                      aria-label={`Go to ${video.name || "Untitled Video"}`}
                    >
                      <Play className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                      <span className="truncate flex-1 transition-opacity duration-200 hover:opacity-80">
                        {video.name || "Untitled Video"}
                      </span>
                      {isActive(video.videoId) && open && (
                        <span className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full transition-opacity duration-200 hover:opacity-80">
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
        className="w-full flex items-center gap-2 p-2 transition-all duration-200 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white hover:shadow-md"
        variant="outline"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform duration-200", open ? "" : "rotate-180")} />
        {open && <span className="transition-opacity duration-200 hover:opacity-80">{open ? "Collapse" : "Expand"}</span>}
      </Button>
    </Sidebar>
  );
}