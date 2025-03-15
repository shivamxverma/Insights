"use client";

import { Menu, Share, ChevronDown, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteVideo } from "@/lib/query";
import { redirect } from "next/navigation";
import { ModeToggle } from "@/app/(protected)/mode-toggle";

interface HeaderProps {
  videoTitle: string;
  moduleId: string;
  courseId: string;
  videoId: string;
}

export function Header({ videoTitle, moduleId, courseId, videoId }: HeaderProps) {
  const handleCopyLink = () => {
    const url = `${window.location.origin}/video-modules/${courseId}`;
    navigator.clipboard.writeText(url);
    alert("Module URL copied to clipboard!");
  };

  const handleDelete = async () => {
    const data = await DeleteVideo(videoId);
    if (data.success) {
      redirect(`/video-modules/${courseId}`);
    }
  };

  return (
    <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700">
      <div className="hidden md:block text-center">
        <h1 className="text-sm font-medium truncate max-w-md text-gray-800 dark:text-gray-200 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
          {moduleId}
        </h1>
      </div>
      <div className="hidden md:block text-center">
        <h1 className="text-sm font-medium truncate max-w-md text-gray-800 dark:text-gray-200 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
          {videoTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ModeToggle />

        <Button
          variant="destructive"
          size="sm"
          className="gap-1 transition-all duration-200 hover:scale-105 hover:shadow-md"
          onClick={() => handleDelete()}
        >
          <Delete className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
          <span className="hidden sm:inline">Delete</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-md"
          onClick={() => handleCopyLink()}
        >
          <Share className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
          <span className="hidden sm:inline">Share</span>
        </Button>

        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:text-blue-500 dark:hover:text-blue-300">
          <span className="text-sm">English</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        </div>
      </div>
    </header>
  );
}

export default Header;