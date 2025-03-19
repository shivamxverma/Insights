"use client";

import { CourseGeneratedSummary } from "@/lib/courseQuery";
import { MemoizedMarkdown } from "./memorized-markdown"; 
import { Course } from "@/lib/types";
import { useEffect, useState } from "react";

interface TranscriptProps {
    course: Course;
    unitIndex: number;
    chapterIndex: number;
  }

export default function CourseAiNotes({course , unitIndex , chapterIndex  }: TranscriptProps) {
    const unitId = course.units[unitIndex].id;
    const chapterId = course.units[unitIndex].chapters[chapterIndex].id;
    const videoId   = course.units[unitIndex].chapters[chapterIndex].videoId;
    // console.log( "in AiNotes - Module ID:", unitId, "Video ID:", videoId);

  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await CourseGeneratedSummary(chapterId );
        if (!data) {
          throw new Error("No summary available for this video.");
        }
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch summary");
        // console.error("Error in AiNotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [unitId , chapterId]);

  return (
    <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
        Summary
      </h2>
      {loading ? (
        <div className="flex items-center justify-center p-6">
          <svg
            className="w-6 h-6 animate-spin text-gray-500 dark:text-gray-400 transition-transform duration-200 hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="4" opacity="0.3" />
            <path d="M4 12a8 8 0 018-8v8h-8z" />
          </svg>
          <span className="text-gray-500 dark:text-gray-400 ml-2 transition-opacity duration-200 hover:opacity-80">Loading summary...</span>
        </div>
      ) : error ? (
        <p className="text-red-500 transition-opacity duration-200 hover:opacity-80">{error}</p>
      ) : summary ? (
        <div className="space-y-4">
          <MemoizedMarkdown content={summary} id="summary" />
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 transition-opacity duration-200 hover:opacity-80">No summary available.</p>
      )}
    </div>
  );
}