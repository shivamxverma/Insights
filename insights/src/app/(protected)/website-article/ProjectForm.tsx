"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, ArrowRight } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { createWebScrapeProject, GetScrapeSumary } from "@/lib/query";

interface Props {
  userId: string;
}

export default function ProjectForm({ userId }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      setError("Authentication required");
      return;
    }

    setIsLoading(true);
    setError(null);

    const Scrapesummary = await GetScrapeSumary(url);
    if (Scrapesummary.summary && Scrapesummary.summary.length > 0 && Scrapesummary.summary != null) {
      router.push(`/website-article/${Scrapesummary.id}`);
      return;
    }

    try {
      // console.log("Creating project with userId:", userId);
      const projectId = await createWebScrapeProject(name, url, userId);

      if (!projectId) {
        throw new Error("Failed to save analysis");
      }

      // Redirect to SummaryPage with the project URL
      router.push(`/website-article/${projectId}`);
    } catch (err) {
      // console.error("Project creation error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 hover:shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-110">
            <Globe className="h-6 w-6 text-blue-500 dark:text-blue-300 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-200" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-all duration-300 hover:text-blue-500 dark:hover:text-blue-300">
              Website Content Analysis
            </h2>
            <p className="text-muted-foreground text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-80">
              Extract valuable insights from any website using our advanced AI analysis tools.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <Input
            name="name"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 transition-all duration-200 hover:shadow-md focus:shadow-lg"
          />
          <Input
            name="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 transition-all duration-200 hover:shadow-md focus:shadow-lg"
          />
          {error && <p className="text-red-500 text-sm transition-opacity duration-200 hover:opacity-80">{error}</p>}
          <Button
            type="submit"
            className="flex items-center gap-2 min-w-[120px] bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Analyzing..." : "Analyze"}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
          </Button>
        </div>
      </form>
    </Card>
  );
}