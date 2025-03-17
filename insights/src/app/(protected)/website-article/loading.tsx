import { Loader2, Globe, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-100 dark:bg-gray-900 text-foreground">
      {/* ProjectForm Skeleton */}
      <Card className="p-8 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md animate-pulse">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <Loader2 className="h-6 w-6 text-gray-400 dark:text-gray-500 animate-spin" />
            </div>
            <div className="flex-1">
              <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-12 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </Card>

      {/* WebscrapingProjects Skeleton */}
      <div className="mt-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8 animate-pulse">
          <div className="h-10 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>

        {/* Projects Grid or Empty State Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <Card
                key={index}
                className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md animate-pulse flex flex-col"
              >
                <div className="flex-1">
                  <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded flex-1" />
                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}