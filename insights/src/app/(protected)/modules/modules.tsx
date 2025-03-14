"use client";
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { Youtube, Copy, Search, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { DeleteModule } from "@/lib/query";

interface Video {
  videoId: string;
  name: string | null;
}

interface Module {
  id: string;
  name: string;
  videos: Video[];
}

interface Props {
  modules: Module[];
}

const VideoModules: React.FC<Props> = ({ modules }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleCopyLink = (moduleId: string) => {
    const url = `${window.location.origin}/video-modules/${moduleId}`;
    navigator.clipboard.writeText(url);
    alert("Module URL copied to clipboard!");
  };

    const handleDelete = async(moduleId:string) => {
      const data = await DeleteModule(moduleId);
      if(data.success){
        redirect(`/modules`);
      }
      
    }

  // Filter modules based on search term
  const filteredModules = modules.filter((module) =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className=" p-4 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Updated Header */}
      <div className="mb-8 text-center flex gap-48">
        <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Your Modules
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Explore your collection
        </p>
        </div>
          <div>
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w- h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-96 pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                />
              </div>
            </div>
          </div>
      </div>


      {filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module, index) => {
            const firstVideoId = module.videos[0]?.videoId;
            const thumbnailUrl = firstVideoId
              ? `https://img.youtube.com/vi/${firstVideoId}/hqdefault.jpg`
              : "https://via.placeholder.com/480x360?text=No+Video";

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/video-modules/${module.id}`} passHref>
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="relative w-full h-48">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${thumbnailUrl})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
                    </div>

                    <div className="p-4 space-y-0 h-24">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                            <Youtube className="w-4 h-4" />
                            YouTube
                          </span>
                          <Button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCopyLink(module.id);
                            }}
                            variant="ghost" size="sm" 
                            className= "flex items-center justify-center h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                            title="Copy Module URL"
                          >
                              <Share className="h-4 w-4" />
                              <span className="hidden sm:inline">Share</span>
                          </Button>
                          
                          <Button variant="destructive" size="sm" className="gap-1"
                            onClick={() => handleDelete(module.id)}
                            >
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2 line-clamp-2">
                          {module.name}
                        </h3>
                      </CardContent>

                      <CardFooter className="p-0 mt-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date().toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </CardFooter>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          {searchTerm
            ? "No modules match your search."
            : "No modules available yet."}
        </p>
      )}
    </div>
  );
};

export default VideoModules;