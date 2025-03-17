"use client";
import { Loader2 } from "lucide-react";
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const CoursesSkeleton: React.FC = () => {
  const skeletonItems = Array(6).fill(null); // Adjust number of placeholders as needed

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-foreground p-4">
      {/* Header Skeleton */}
      <div className="mb-8 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="max-w-md w-full">
          <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonItems.map((_, index) => (
          <Card
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse"
          >
            <div className="relative w-full h-48 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <Loader2 className="animate-spin w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="p-4 space-y-0 h-24">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
                    <div className="h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                </div>
                <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mt-2" />
              </CardContent>
              <CardFooter className="p-0 mt-2 flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoursesSkeleton;