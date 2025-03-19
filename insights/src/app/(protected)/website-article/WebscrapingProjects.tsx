import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Globe, ExternalLink, Trash2 } from "lucide-react";
import { DeleteWebProject, GetWebProject } from "@/lib/query";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const WebscrapingProjects = async () => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  const projects = (await GetWebProject()) || [];

  // Server action to handle deletion
  async function handleDelete(formData: FormData) {
    "use server";
    const projectId = formData.get("projectId") as string;
    try {
      await DeleteWebProject(projectId);
      revalidatePath("/website-article"); // Refresh the page after deletion
    } catch (error) {
      // console.error("Failed to delete project:", error);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-100 dark:bg-gray-900 text-foreground">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 transition-all duration-300 hover:text-blue-500 dark:hover:text-blue-300">
          Your Web Scraping Projects
        </h1>
      </header>

      {projects.length === 0 ? (
        <Card className="p-8 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md transition-all duration-300 hover:shadow-lg">
          <Globe className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 transition-transform duration-200 hover:scale-110" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
            No Projects Yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 transition-opacity duration-200 hover:opacity-80">
            Start by creating your first web scraping project!
          </p>
          <Link href="/website-article/create">
            <Button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-md">
              <PlusCircle className="mr-2 h-4 w-4 transition-transform duration-200 hover:scale-110" />
              Create Project
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 truncate transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center transition-opacity duration-200 hover:opacity-90">
                  <Globe className="mr-2 h-4 w-4 transition-transform duration-200 hover:scale-110" />
                  <span className="truncate">{project.url}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/website-article/${project.id}`} className="flex-1">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-md">
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                  asChild
                >
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 hover:scale-110" />
                  </a>
                </Button>
                <form action={handleDelete}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="icon"
                    className="border-gray-300 dark:border-gray-600 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                    title="Delete Project"
                  >
                    <Trash2 className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebscrapingProjects;