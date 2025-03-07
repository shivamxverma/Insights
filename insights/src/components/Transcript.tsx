// components/Transcript.tsx
import React, { useEffect, useState } from "react";

// Function to decode HTML entities
const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptProps {
  moduleId: string;
  videoId: string;
}

const Transcript: React.FC<TranscriptProps> = ({ moduleId, videoId }) => {
  const [transcript, setTranscript] = useState<TranscriptSegment[] | null>(null);
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
          // Ensure transcript is an array
          const parsedTranscript = Array.isArray(data.transcript)
            ? data.transcript
            : JSON.parse(data.transcript || "[]");
          // Validate and clean the data
          const cleanedTranscript = parsedTranscript.map((seg) => ({
            text: seg.text || "",
            start: typeof seg.start === "number" ? seg.start : 0,
            duration: typeof seg.duration === "number" ? seg.duration : 0,
          }));
          setTranscript(cleanedTranscript);
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

  // Convert seconds to HH:MM:SS format
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "00:00:00"; // Fallback for invalid times
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [hrs, mins, secs]
      .map((v) => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Transcript</h1>
      {loading ? (
        <p className="text-gray-500">Loading transcript...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : transcript && Array.isArray(transcript) && transcript.length > 0 ? (
        <div className="space-y-4">
          {transcript.map((segment, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-blue-600">
                {formatTime(segment.start)}
              </h3>
              <p className="text-gray-700">{decodeHtml(segment.text)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No transcript available.</p>
      )}
    </div>
  );
};

export default Transcript;