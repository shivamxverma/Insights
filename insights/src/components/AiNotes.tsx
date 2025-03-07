// src/components/AiNote.tsx
"use client";
import { useEffect, useState } from "react";
import { rephraseTranscript, generateSummary } from "@/lib/gemini";

interface TranscriptProps {
  moduleId: string;
  videoId: string;
}

interface TranscriptItem {
  id: number;
  time: string;
  seconds: number;
  text: string;
}

export default function AiNote({ moduleId, videoId }: TranscriptProps) {
  console.log("in AiNote - Module ID:", moduleId, "Video ID:", videoId);

  const [transcript, setTranscript] = useState<string | null>(null);
  const [rephrasedTranscript, setRephrasedTranscript] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranscript = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/getTranscript?moduleId=${moduleId}&videoId=${videoId}`);
        const data = await res.json();

        if (res.ok) {
          setTranscript(data.transcript || "No transcript available");
        } else {
          setError(data.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching transcript:", error);
        setError("Failed to fetch transcript.");
      } finally {
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [moduleId, videoId]);

  useEffect(() => {
    const processTranscript = async () => {
      if (!transcript) return;

      try {
        const rephrased = await rephraseTranscript(transcript);
        setRephrasedTranscript(rephrased);

        const summ = await generateSummary(rephrased);
        setSummary(summ);
      } catch (error) {
        console.error("Error processing transcript:", error);
        setError("Failed to process transcript.");
      }
    };

    processTranscript();
  }, [transcript]);

  return (
    <div className="p-6 text-black rounded-lg shadow-lg">
      <h2 className="text-xl  mb-4">Summary</h2>
      {loading ? (
        <p className="text-gray-300">Loading...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : summary ? (
        <div className="space-y-4">
          {summary.split("\n").map((line, index) => (
            <p key={index} className={line.startsWith("-") ? "ml-6" : "font-bold"}>
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