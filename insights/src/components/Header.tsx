"use client";

import { Menu, Share, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
interface HeaderProps {
  videoTitle: string;
  moduleId : string;
  courseId : string
}

export function Header({ videoTitle , moduleId , courseId}: HeaderProps) {

  const handleCopyLink = (moduleId: string) => {
    const url = `${window.location.origin}/video-modules/${courseId}`;
    navigator.clipboard.writeText(url);
    alert("Module URL copied to clipboard!");
  }

  return (
    <header className="flex items-center justify-between p-3 border-b border-border bg-background text-foreground">
      <div className="hidden md:block text-center">
        <h1 className="text-sm font-medium truncate max-w-md">
           {moduleId}
        </h1>
      </div>
      <div className="hidden md:block text-center">
        <h1 className="text-sm font-medium truncate max-w-md">
          {videoTitle} 
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1"
         onClick={() => handleCopyLink(moduleId)}
        >
          <Share className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>

        {/* modeToggle */}

        <div className="flex items-center gap-1">
          <span className="text-sm">English</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}

export default Header;