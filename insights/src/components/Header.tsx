"use client";

import { Menu, Share, ChevronDown, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteVideo } from "@/lib/query";
import { redirect } from "next/navigation";
interface HeaderProps {
  videoTitle: string;
  moduleId : string;
  courseId : string
  videoId : string
}

export function Header({ videoTitle , moduleId , courseId ,videoId}: HeaderProps) {

  const handleCopyLink = () => {
    const url = `${window.location.origin}/video-modules/${courseId}`;
    navigator.clipboard.writeText(url);
    alert("Module URL copied to clipboard!");
  }
  const handleDelete = async() => {
    const data = await DeleteVideo(videoId);
    if(data.success){
      redirect(`/video-modules/${courseId}`);
    }
    
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

      <Button variant="destructive" size="sm" className="gap-1"
         onClick={() => handleDelete()}
        >
          <span className="hidden sm:inline">Delete</span>
        </Button>

        <Button variant="ghost" size="sm" className="gap-1"
         onClick={() => handleCopyLink()}
        >
          <Share className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>

  

        <div className="flex items-center gap-1">
          <span className="text-sm">English</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}

export default Header;