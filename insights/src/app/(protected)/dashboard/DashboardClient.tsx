"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/(protected)/app-sidebar";
import{ VideoSidebar }from "@/components/VideoSidebar";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Video {
  id: string;
  name: string | null;
  url: string;
  videoId: string;
  summary: string | null;
}

interface Module {
  id: string;
  name: string | null;
  videos: Video[];
  createdAt: Date;
}

export default function DashboardClient({ modules }: { modules: Module[] }) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedModuleId, setSelectedModuleId] = useState(modules[0]?.id || "");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const selectedModule = modules.find((module) => module.id === selectedModuleId) || modules[0];

  const handleCreateModule = () => {
    router.push("/video-modules/create");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header videoTitle="Dashboard" lecturer="Your Learning Hub" />
          <main className="flex-1 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Your Modules</h2>
              <Button onClick={handleCreateModule} variant="default" className="gap-2">
                <Plus className="h-4 w-4" /> Create New Module
              </Button>
            </div>
            <div className="flex h-full overflow-hidden">
              <VideoSidebar
                courseId={selectedModuleId}
                videoId={selectedModule.videos[0]?.videoId || ""}
                videos={selectedModule.videos}
              />
              <div className="flex-1 ml-4 overflow-hidden">
                <Tabs defaultValue="overview" className="h-full">
                  <TabsList className="w-full justify-start border-b border-border rounded-none bg-background">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="modules" className="data-[state=active]:bg-primary/10">
                      All Modules
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="h-full overflow-hidden p-0 m-0">
                    <div className="h-full overflow-y-auto p-4">
                      <h3 className="text-xl font-semibold mb-4">
                        {selectedModule.name || "Untitled Module"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Created on: {selectedModule.createdAt.toLocaleDateString()}
                      </p>
                      <ul className="list-disc pl-5">
                        {selectedModule.videos.map((video) => (
                          <li key={video.id} className="mb-2">
                            <Link
                              href={`/video-modules/${selectedModule.id}/${video.videoId}`}
                              className="text-primary hover:underline"
                            >
                              {video.name || "Untitled Video"}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="modules" className="h-full overflow-hidden p-0 m-0">
                    <div className="h-full overflow-y-auto p-4">
                      {modules.map((module) => (
                        <div
                          key={module.id}
                          className="mb-4 p-3 bg-card rounded-lg hover:bg-accent cursor-pointer"
                          onClick={() => setSelectedModuleId(module.id)}
                        >
                          <h3 className="text-lg font-semibold">
                            {module.name || "Untitled Module"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {module.videos.length} video(s) | Created on:{" "}
                            {module.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}