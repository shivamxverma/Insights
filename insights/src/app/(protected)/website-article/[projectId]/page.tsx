
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import SummaryPage from "./summary"; 
import { scrapedContent } from "@/lib/Scraper";
import { GetScrapeSumary, GetScrapeSumaryThroughProjectId } from "@/lib/query";

interface Props {
  params: Promise<{ projectId: string }>; 
}

export default async function WebScrapingPage({ params }: Props) {
  // Await params to resolve the dynamic route parameters
  const{ projectId } = await params;


  if (!projectId ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">Project is not created</div>
      </div>
    );
  }

  try {
    // Check if a summary already exists in the database
    const existingSummary = await GetScrapeSumaryThroughProjectId(projectId);

    // If a summary exists, render it directly
    if (existingSummary && typeof existingSummary === "string" && existingSummary !== "") {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
          <SummaryPage content={existingSummary} projectId={projectId} />
        </div>
      );
    }

    // If no summary exists, scrape the content
    const content = (await scrapedContent(projectId)) || "";

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <SummaryPage content={content} projectId={projectId} />
      </div>
    );
  } catch (error) {
    console.error("Error in WebScrapingPage:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">
          Error fetching content: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }
}