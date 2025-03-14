"use client";
import { useState, useEffect } from "react";
import { MemoizedMarkdown } from "../../../../components/memorized-markdown"; // Adjust path if needed
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card"; // Import Card component
import { GetScrapeSumary, SaveSummaryWebscraper } from "@/lib/query";

interface Props {
  content: string;
  Projecturl : string;
}

export default function SummaryPage( props: Props) {
  const { content , Projecturl } = props;
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

   

  useEffect(() => {
    if (!content) return;
    
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);

      const Scrapesummary = await GetScrapeSumary(Projecturl);
      if(Scrapesummary && Scrapesummary.length > 0 && Scrapesummary != null){
        setSummary(Scrapesummary);
        setIsLoading(false);
        return;
      }

      try {
        const url = `/api/scraping-summary?content=${encodeURIComponent(
          JSON.stringify(content)
        )}`;
        const eventSource = new EventSource(url);

        let result = "";

        eventSource.onmessage = async (event) => {
          const data = JSON.parse(event.data);

          if (data.text === "[DONE]") {
            setSummary(result);
            eventSource.close();
            const data = await SaveSummaryWebscraper( Projecturl,result);
            setIsLoading(false);
            return;
          }

          if (data.error) {
            setError(data.error);
            eventSource.close();
            setIsLoading(false);
            return;
          }

          result += data.text;
          setSummary(result);
        };

        eventSource.onerror = async() => {
          setError("Failed to connect to summary service");
          eventSource.close();
          setIsLoading(false);
        };
      } catch (err) {
        setError("An unexpected error occurred");
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [content]);

  return (
    <div className="h-full flex flex-col p-8">
      <div className="w-full max-w-4xl flex-1">
        {/* Loading State */}
        {isLoading && !summary ? (
          <Card className="flex items-center justify-center p-6">
            <svg
              className="w-8 h-8 animate-spin text-neutral-400 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="4" opacity="0.3" />
              <path d="M4 12a8 8 0 018-8v8h-8z" />
            </svg>
            <span className="text-neutral-400 text-lg">Generating your summary...</span>
          </Card>
        ) : error ? (
          // Error State
          <Card className="p-6 border border-red-400">
            <p className="text-center text-red-400 text-lg">{error}</p>
          </Card>
        ) : summary ? (
          // Success State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* <Card className="p-6 border border-neutral-700"> */}
              <MemoizedMarkdown content={summary} id="summary" />
            {/* </Card> */}
          </motion.div>
        ) : (
          // Default State (No Content)
          <Card className="p-6 border border-neutral-700">
            <p className="text-center text-neutral-400 text-lg">
              No content available yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
