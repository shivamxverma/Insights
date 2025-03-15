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
export default function ProjectForm(props : Props) {
  const { userId } = props;
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
          if(Scrapesummary.summary && Scrapesummary.summary.length > 0 && Scrapesummary.summary != null){
            router.push(`/website-article/${Scrapesummary.id}`);
            return;
          }
  
    try {
      console.log("Creating project with userId:", userId);
      const projectId = await createWebScrapeProject(name, url, userId);
  
      if (!projectId) {
        throw new Error("Failed to save analysis");
      }
  
      // Redirect to SummaryPage with the project URL
      router.push(`/website-article/${projectId}`);
    } catch (err) {
      console.error("Project creation error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 border-2 mb-8">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Website Content Analysis</h2>
              <p className="text-muted-foreground">
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
            />
            <Input
              name="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              className="flex items-center gap-2 min-w-[120px]"
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..."  : "Analyzed"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}