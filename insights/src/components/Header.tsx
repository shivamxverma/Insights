"use client";

import { Menu, Share, ChevronDown, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteVideo } from "@/lib/query";
import { redirect } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";

interface HeaderProps {
  type: "module" | "course";
  title: string;
  parentTitle?: string;
  id: string;
  parentId?: string;
}

export function Header({ type, title, parentTitle, id, parentId }: HeaderProps) {
  const handleCopyLink = () => {
    const baseUrl = window.location.origin;
    const url =
      type === "module"
        ? `${baseUrl}/video-modules/${id}/${parentId}`
        : `${baseUrl}/course/${parentId}/${id.split("/")[1]}/${id.split("/")[2]}`;

    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!",{
      style: {
        backgroundColor: "green", // Red for destructive
        color: "white",
      },
    }); 
  };

  const handleDelete = async () => {
    if (type === "module") {
      const data = await DeleteVideo(parentId!, id);
      if (data.success) {
        toast.success("Video deleted successfully!"); 
        redirect(`/video-modules/${id}`);
      } else {
        toast.error("Failed to delete video.",{
          style: {
            backgroundColor: "#dc2626", // Red for destructive
            color: "white",
          },
        }); 
      }
    }
  };

  return (
    <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700">
      <div className="hidden md:block text-center">
        <h1 className="text-sm font-medium truncate max-w-md text-gray-800 dark:text-gray-200 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
          {parentTitle || "N/A"}
        </h1>
      </div>
      <div className="hidden md:block text-center">
        <h1 className="text-sm font-medium truncate max-w-md text-gray-800 dark:text-gray-200 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ModeToggle />

        {type === "module" && (
          <Button
            variant="destructive"
            size="sm"
            className="gap-1 transition-all duration-200 hover:scale-105 hover:shadow-md"
            onClick={() => handleDelete()}
          >
            <Delete className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        )}

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
