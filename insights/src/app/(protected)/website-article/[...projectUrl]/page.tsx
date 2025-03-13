// app/webscraping/page.tsx
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import SummaryPage from "./summary";
import { scrapedContent } from "@/lib/Scraper";
import { cache } from "react";

interface Props {
  params: { projectUrl: string[] };
  searchParams: Record<string, string>;
}

// Cache the scraper function to prevent duplicate calls
const cachedScrapedContent = cache(scrapedContent);

export default async function WebScrapingPage({ params, searchParams }: Props) {
  // Get the session on the server.
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  const { projectUrl } = params;
  
  if (!projectUrl || projectUrl.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">No URL provided</div>
      </div>
    );
  }

  // Reconstruct the URL properly
  const queryParams = await searchParams;
  
  let protocol = decodeURIComponent(params.projectUrl[0]);
  const baseUrl = params.projectUrl.slice(1).join('/');
  const queryString = new URLSearchParams(queryParams).toString();
  if (protocol.endsWith(':')) protocol += '//';
  const fullUrl = `${protocol}${baseUrl}${queryString ? '?' + queryString : ''}`;

  try {
    // Use the cached version to prevent duplicate calls
    const content = await cachedScrapedContent(fullUrl) || "";
    
    return (
      <div className="">
        <SummaryPage content={content} />
      </div>
    );
  } catch (error) {
    console.error("Error scraping content:", error);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">
          Error fetching content: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }
}