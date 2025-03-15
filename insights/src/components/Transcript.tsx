"use client";
import React, { useEffect, useState } from "react";

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptProps {
  moduleId: string;
  videoId: string;
}

interface TranscriptResponse {
  transcript: TranscriptSegment[];
  generatedSummary?: string;
}

interface ErrorResponse {
  error: string;
}

const Transcript: React.FC<TranscriptProps> = ({ moduleId, videoId }) => {
  const [transcript, setTranscript] = useState<TranscriptSegment[] | null>(null);
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
        const res = await fetch(`/api/getTranscript?moduleId=${moduleId}&videoId=${videoId}`);
        const data: TranscriptResponse | ErrorResponse = await res.json();

        if (res.ok && "transcript" in data) {
          setTranscript(data.transcript);

          const fullText = data.transcript
            .map(segment => decodeHtml(segment.text))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

          const words = fullText.split(" ");
          const batches: string[] = [];

          for (let i = 0; i < words.length; i += 50) {
            batches.push(words.slice(i, i + 50).join(" "));
          }

          setTextBatches(batches);
        } else if ("error" in data) {
          setError(data.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching transcript:", error);
        setError("Failed to fetch transcript.");
      } finally {
        setLoading(false);
      }
    };

    if (moduleId && videoId) {
      fetchTranscript();
    }
  }, [moduleId, videoId]);

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

export default Transcript;