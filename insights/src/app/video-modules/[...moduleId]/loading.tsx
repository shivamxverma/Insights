"use client";
import { Loader2 } from "lucide-react";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";

const CourseLearningSkeleton: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-foreground">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 animate-pulse">
          <div className="h-8 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="space-y-2">
            {Array(3).fill(null).map((_, index) => (
              <div key={index} className="h-6 w-full bg-gray-300 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">
          {/* Header Skeleton */}
          <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between animate-pulse">
            <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>

          {/* Split Container Skeleton */}
          <main className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
            {/* Left Section Skeleton */}
            <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-700 animate-pulse" style={{ flex: "0 0 60%" }}>
              <div className="relative h-[400px] bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-gray-800">
                <Tabs defaultValue="transcript" className="flex flex-col h-full">
                  <TabsList className="w-full justify-start border-b mt-2 border-gray-200 dark:border-gray-700 rounded-none bg-white dark:bg-gray-800">
                    <Button variant="outline" disabled className="h-10 w-24 bg-gray-300 dark:bg-gray-700" />
                    <TabsTrigger value="transcript" className="h-10 w-24 bg-gray-300 dark:bg-gray-700" />
                    <TabsTrigger value="mynotes" className="h-10 w-24 bg-gray-300 dark:bg-gray-700" />
                    <Button variant="outline" disabled className="h-10 w-24 bg-gray-300 dark:bg-gray-700" />
                  </TabsList>
                  <ScrollArea className="h-full">
                    <div className="p-3 space-y-2">
                      {Array(5).fill(null).map((_, index) => (
                        <div key={index} className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                      ))}
                    </div>
                  </ScrollArea>
                </Tabs>
              </div>
            </div>

            {/* Drag Handle Skeleton */}
            <div className="hidden lg:block w-1 bg-gray-200 dark:bg-gray-700" />

            {/* Right Section Skeleton */}
            <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-800 animate-pulse" style={{ flex: "0 0 39.75%" }}>
              <Tabs defaultValue="notes" className="flex flex-col h-full">
                <TabsList className="w-full justify-start border-b border-gray-200 dark:border-gray-700 rounded-none bg-white dark:bg-gray-800">
                  <TabsTrigger value="notes" className="h-10 w-24 bg-gray-300 dark:bg-gray-700" />
                  <TabsTrigger value="chat" className="h-10 w-24 bg-gray-300 dark:bg-gray-700" />
                  <TabsTrigger value="quiz" className="h-10 w-24 bg-gray-300 dark:bg-gray-700" />
                </TabsList>
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-2">
                    {Array(5).fill(null).map((_, index) => (
                      <div key={index} className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                    ))}
                  </div>
                </ScrollArea>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CourseLearningSkeleton;