
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import SummaryPage from "./summary"; 
import { scrapedContent } from "@/lib/Scraper";
import { GetScrapeSumary } from "@/lib/query";

interface Props {
  params: Promise<{ projectUrl: string[] }>; // Updated to reflect that params is a Promise
  searchParams: Promise<Record<string, string | string[]>>; // Updated to reflect that searchParams is a Promise
}

export default async function WebScrapingPage({ params, searchParams }: Props) {
  // Get the session on the server
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  // Await params to resolve the dynamic route parameters
  const resolvedParams = await params;
  const { projectUrl } = resolvedParams;

  if (!projectUrl || projectUrl.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">No URL provided</div>
      </div>
    );
  }

  // Await searchParams to resolve the query parameters
  let queryString = "";
  try {
    const resolvedSearchParams = await searchParams;

    // Sanitize searchParams to ensure only string key-value pairs are used
    const sanitizedParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(resolvedSearchParams)) {
      if (typeof key !== "string" || (typeof value !== "string" && !Array.isArray(value))) {
        console.warn(`Skipping invalid searchParams key-value pair: ${key}=${value}`);
        continue;
      }
      // If value is an array (e.g., ?key=value1&key=value2), convert to a comma-separated string
      sanitizedParams[key] = Array.isArray(value) ? value.join(",") : value;
    }

    queryString = new URLSearchParams(sanitizedParams).toString();
  } catch (error) {
    console.error("Error processing searchParams:", error);
    queryString = ""; // Fallback to empty query string if there's an error
  }

  // Reconstruct the URL properly
  let protocol = decodeURIComponent(projectUrl[0]);
  const baseUrl = projectUrl.slice(1).join("/");
  if (protocol.endsWith(":")) protocol += "//";
  const fullUrl = `${protocol}${baseUrl}${queryString ? "?" + queryString : ""}`;

  try {
    // Check if a summary already exists in the database
    const existingSummary = await GetScrapeSumary(fullUrl);

    // If a summary exists, render it directly
    if (existingSummary && typeof existingSummary === "string" && existingSummary.trim() !== "") {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
          <SummaryPage content={existingSummary} Projecturl={fullUrl} />
        </div>
      );
    }

    // If no summary exists, scrape the content
    const content = (await scrapedContent(fullUrl)) || "";

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <SummaryPage content={content} Projecturl={fullUrl} />
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