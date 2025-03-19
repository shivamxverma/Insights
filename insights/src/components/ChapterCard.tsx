"use client";
import { cn } from "@/lib/utils";
import { Chapter } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  chapter: Chapter;
  chapterIndex: number;
  completedChapters: Set<string>;
  setCompletedChapters: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export type ChapterCardHandler = {
  triggerLoad: () => void;
};

const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(
  ({ chapter, chapterIndex, setCompletedChapters, completedChapters }, ref) => {
    const [success, setSuccess] = React.useState<boolean | null>(null);
    const { mutate: getChapterInfo, status } = useMutation({
      mutationFn: async () => {
        const response = await axios.post("/api/chapter/getInfo", {
          chapterId: chapter.id,
        });
        return response.data;
      },
    });

    const addChapterIdToSet = React.useCallback(() => {
      setCompletedChapters((prev) => {
        const newSet = new Set(prev);
        newSet.add(chapter.id);
        return newSet;
      });
    }, [chapter.id, setCompletedChapters]);

    React.useEffect(() => {
      if (chapter.videoId) {
        setSuccess(true);
        addChapterIdToSet();
      }
    }, [chapter, addChapterIdToSet]);

    React.useImperativeHandle(ref, () => ({
      async triggerLoad() {
        if (chapter.videoId) {
          addChapterIdToSet();
          return;
        }
        getChapterInfo(undefined, {
          onSuccess: () => {
            setSuccess(true);
            addChapterIdToSet();
          },
          onError: (error) => {
            // console.error(error);
            setSuccess(false);
            toast.error("There was an error loading your chapter", {
              
              description: "Error",
              
              style: {
                backgroundColor: "#dc2626", // Red for destructive
                color: "white",
              },
            });
            addChapterIdToSet();
          },
        });
      },
    }));

    return (
      <div
        key={chapter.id}
        className={cn(
          "px-4 py-3 rounded-lg flex justify-between items-center transition-all duration-300 hover:shadow-md",
          {
            "bg-white dark:bg-gray-800": success === null,
            "bg-red-600 dark:bg-red-700": success === false,
            "bg-blue-500 dark:bg-blue-600": success === true,
          }
        )}
      >
        <h5 className="text-base font-medium text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-300">
          {chapter.name}
        </h5>
        {status === "pending" && (
          <Loader2 className="w-5 h-5 text-gray-500 dark:text-gray-300 animate-spin transition-transform duration-200 hover:scale-110" />
        )}
      </div>
    );
  }
);

ChapterCard.displayName = "ChapterCard";

export default ChapterCard;