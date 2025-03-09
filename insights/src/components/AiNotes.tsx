"use client";
import { useEffect, useState } from "react";

interface TranscriptProps {
  moduleId: string;
  videoId: string;
}

export default function AiNotes({ moduleId, videoId }: TranscriptProps) {
  console.log("in AiNotes - Module ID:", moduleId, "Video ID:", videoId);

  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/getSummary?moduleId=${moduleId}&videoId=${videoId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch summary");
        }

        setSummary(data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch summary");
        console.error("Error in AiNotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [moduleId, videoId]);

  return (
    <div className="p-6 text-black rounded-lg shadow-lg">
      <h2 className="text-xl text-gray-700 mb-4">Summary</h2>
      {loading ? (
        <p className="text-gray-700">Loading...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : summary ? (
        <div className="space-y-4">
          {summary.split("\n").map((line, index) => (
            <p key={index} className={line.startsWith("-") ? "text-gray-700 ml-6" : "text-gray-700 font-bold"}>
              {line}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No summary available.</p>
      )}
    </div>
  );
}