"use client";

import { Menu, Share, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoSidebar } from "./VideoSidebar";
// import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  videoTitle: string;
  lecturer: string;
}

export function Header({ videoTitle, lecturer }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-3 border-b border-border bg-background text-foreground">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">Detail</span>
 
      </div>

      <div className="hidden md:block text-center">
        <h1 className="text-sm font-medium truncate max-w-md">
          {videoTitle} — {lecturer}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1">
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