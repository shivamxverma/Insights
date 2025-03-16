"use client";
import React, { useEffect, useState } from "react";
import { Course } from "@/lib/types";
import { GetTranscriptFromDB } from "@/lib/courseQuery";

interface TranscriptProps {
    course: Course;
    unitIndex: number;
    chapterIndex: number;
  }

const CourseTranscript: React.FC<TranscriptProps> = ({ course, unitIndex, chapterIndex }) => {
  const [transcriptText, setTranscriptText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [textBatches, setTextBatches] = useState<string[]>([]);

  const decodeHtml = (html: string): string => {
    return html
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/'/g, "'");
  };

  useEffect(() => {
    const fetchTranscript = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const videoId = course.units[unitIndex]?.chapters[chapterIndex]?.videoId;

        if (!videoId) {
          setError("Invalid unit or chapter index.");
          setLoading(false);
          return;
        }

        const transcript = await GetTranscriptFromDB({course , unitIndex , chapterIndex});

        if (transcript) {
          setTranscriptText(transcript);

          const fullText = decodeHtml(transcript)
            .replace(/\s+/g, " ")
            .trim();

          const words = fullText.split(" ");
          const batches: string[] = [];

          for (let i = 0; i < words.length; i += 50) {
            batches.push(words.slice(i, i + 50).join(" "));
          }

          setTextBatches(batches);
        } else {
          setError("No transcript available.");
        }
      } catch (error) {
        console.error("Error fetching transcript:", error);
        setError("Failed to fetch transcript.");
      } finally {
        setLoading(false);
      }
    };

    if (course && unitIndex >= 0 && chapterIndex >= 0) {
      fetchTranscript();
    }
  }, [course, unitIndex, chapterIndex]);

  return (
    <div className="p-4 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
        Video Transcript
      </h1>
      {loading ? (
        <div className="flex justify-center my-8">
          <svg
            className="w-10 h-10 animate-spin text-blue-500 dark:text-blue-300 transition-transform duration-200 hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="4" opacity="0.3" />
            <path d="M4 12a8 8 0 018-8v8h-8z" />
          </svg>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md border border-red-200 dark:border-red-700 transition-opacity duration-200 hover:opacity-80">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : textBatches.length > 0 ? (
        <div className="space-y-2">
          {textBatches.map((batch, index) => (
            <div
              key={index}
              className="p-3 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm"
            >
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-opacity duration-200 hover:opacity-80">
                {batch}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/50 p-4 rounded-md border border-yellow-200 dark:border-yellow-700 transition-opacity duration-200 hover:opacity-80">
          <p className="text-yellow-600 dark:text-yellow-400">No transcript available for this video.</p>
        </div>
      )}
    </div>
  );
};

export default CourseTranscript;