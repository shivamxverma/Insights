"use client";
import { useState, useEffect } from "react";
import { MemoizedMarkdown } from "../../../../components/memorized-markdown";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { GetScrapeSumary, SaveSummaryWebscraper } from "@/lib/query";
import { SummarizeScrapeContent } from "@/lib/geminiAPI";

interface Props {
  content: string;
  projectUrl: string; // Renamed to camelCase for consistency
}

export default function SummaryPage({ content, projectUrl }: Props) {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!content) {
      setError("No content provided to summarize.");
      return;
    }

    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if a summary already exists in the database
        const existingSummary = await GetScrapeSumary(projectUrl);
        if (existingSummary && existingSummary.trim().length > 0) {
          setSummary(existingSummary);
          setIsLoading(false);
          return;
        }

        const res = await SummarizeScrapeContent(content);
        if (!res) {
          throw new Error(`Failed to fetch summary: ${res} `);
        }

        // const data = await res.json();
        if (!res) {
          throw new Error(res);
        }

        const generatedSummary = res ;
        if (!generatedSummary) {
          throw new Error("No summary content returned from the API.");
        }

        setSummary( generatedSummary);
        await SaveSummaryWebscraper(projectUrl, generatedSummary);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(errorMessage);
        console.error("Error fetching summary:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [content, projectUrl]);

  return (
    <div className="h-full flex flex-col p-6 bg-background text-foreground">
      <div className="w-full max-w-3xl mx-auto flex-1">
        {isLoading && !summary ? (
          <Card className="flex items-center justify-center p-6 border border-border bg-muted">
            <svg
              className="w-8 h-8 animate-spin text-muted-foreground mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="4" opacity="0.3" />
              <path d="M4 12a8 8 0 018-8v8h-8z" />
            </svg>
            <span className="text-muted-foreground text-lg">Generating your summary...</span>
          </Card>
        ) : error ? (
          <Card className="p-6 border border-destructive bg-muted">
            <p className="text-center text-destructive text-lg">{error}</p>
          </Card>
        ) : summary ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="p-6 border border-border bg-background shadow-sm">
              <MemoizedMarkdown content={summary} id="summary" />
            </Card>
          </motion.div>
        ) : (
          <Card className="p-6 border border-border bg-muted">
            <p className="text-center text-muted-foreground text-lg">No content available yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}