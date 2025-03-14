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
      console.error("Failed to delete project:", error);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Your Web Scraping Projects
        </h1>
      </header>

      {projects.length === 0 ? (
        <Card className="p-8 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <Globe className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Projects Yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start by creating your first web scraping project!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col"
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  <span className="truncate">{project.url}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/website-article/${project.id}`} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-300 dark:border-gray-600"
                  asChild
                >
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </a>
                </Button>
                <form action={handleDelete}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="icon"
                    className="border-gray-300 dark:border-gray-600 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete Project"
                  >
                    <Trash2 className="h-4 w-4" />
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