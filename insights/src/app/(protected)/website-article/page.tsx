// app/webscraping/page.tsx
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import WebscrapingProjects from "./WebscrapingProjects";
import ProjectForm from "./ProjectForm";
import { scrapedContent } from "@/lib/Scraper";

export default async function WebScrapingPage() {
  // Get the session on the server.
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

 
  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectForm userId ={session.user.id} />
     
    </div>
  );
}
