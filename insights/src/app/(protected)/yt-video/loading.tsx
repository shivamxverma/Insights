"use client";
import React from "react";

const CreateVideoClientSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-foreground">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section Skeleton */}
        <div className="text-center mb-8 animate-pulse">
          <div className="h-10 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mx-auto mb-2" />
          <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mx-auto" />
        </div>

        {/* URL Input Section Skeleton */}
        <div className="flex items-center gap-4 mb-8 animate-pulse">
          <div className="flex-1">
            <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>

        <div className="mt-12">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-10 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mx-auto mb-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(6)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-pulse"
                >
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
                  <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-16 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideoClientSkeleton;