"use client";
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { Youtube } from "lucide-react";

interface Video {
  videoId: string;
  name: string | null;
}

interface Module {
  id: string;
  name: string;
  videos: Video[];
  notesCount?: number;
  screenshotsCount?: number;
}

interface Props {
  modules: Module[];
}

const VideoModules: React.FC<Props> = ({ modules }) => {
  // Animation variants for fade-in effect
//   const cardVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//   };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Your Video Modules
      </h1>

      {modules.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const firstVideoId = module.videos[0]?.videoId;
            const thumbnailUrl = firstVideoId
              ? `https://img.youtube.com/vi/${firstVideoId}/hqdefault.jpg`
              : "https://via.placeholder.com/480x360?text=No+Video";

            return (
              <motion.div
                key={module.id}
                // variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                {/* Wrap the entire card in a Link to make it clickable */}
                <Link href={`/video-modules/${module.id}`} passHref>
                  <Card
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer"
                  >
                    {/* Thumbnail with Gradient Overlay */}
                    <div className="relative w-full h-48">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${thumbnailUrl})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full transition-colors duration-300 hover:bg-blue-200 dark:hover:bg-blue-800">
                          <Youtube className="w-4 h-4" />
                          YouTube
                        </span>
                        {/* Prevent event propagation on the link button */}
                        <Link
                          href={`/video-modules/${module.id}`}
                          passHref
                          onClick={(e) => e.stopPropagation()} // Prevent the card's click event from firing
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                        >
                          <span className="text-gray-600 dark:text-gray-300">🔗</span>
                        </Link>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2 line-clamp-2">
                        {module.name}
                      </h3>
                    </CardContent>

                    <CardFooter className="px-4 pb-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {new Date().toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No modules available yet.
        </p>
      )}
    </div>
  );
};

export default VideoModules;