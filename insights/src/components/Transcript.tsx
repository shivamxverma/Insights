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

  useEffect(() => {
    const fetchTranscript = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/getTranscript?moduleId=${moduleId}&videoId=${videoId}`);
        const data: TranscriptResponse | ErrorResponse = await res.json();

        if (res.ok && "transcript" in data) {
          setTranscript(data.transcript);
          
          // Process full transcript into batches of 50 words
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
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Video Transcript</h1>
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      ) : textBatches.length > 0 ? (
        <div className="space-y-2">
          {textBatches.map((batch, index) => (
            <div 
              key={index} 
            >
              <p className="text-gray-700 leading-relaxed">{batch}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <p className="text-yellow-600">No transcript available for this video.</p>
        </div>
      )}
    </div>
  );
};

export default Transcript;