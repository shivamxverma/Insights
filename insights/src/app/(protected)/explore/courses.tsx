"use client";
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { Youtube, Search, Share, User, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DeleteCourse } from "@/lib/courseQuery"; // Assuming you have a delete function for courses
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Chapter {
  id: string;
  name: string;
  videoId: string;
  courseQuiz: any[];
}

interface Unit {
  id: string;
  name: string;
  chapters: Chapter[];
}

interface Course {
  id: string;
  name: string;
  units: Unit[];
  userId?: string; // Optional, if courses are linked to users
}

interface Props {
  courses: Course[]; // User's courses
  allCourses: Course[]; // All courses
  userId: string;
}

const Courses: React.FC<Props> = ({ courses: myCourses, allCourses, userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("my-courses");
  const router = useRouter();

  const handleCopyLink = (courseId: string) => {
    const url = `${window.location.origin}/course/${courseId}/0/0`;
    navigator.clipboard.writeText(url);
    alert("Course URL copied to clipboard!");
  };

  const handleDelete = async (courseId: string) => {
    const data = await DeleteCourse(courseId, userId); // Pass userId for authorization
    if (data.success) {
      router.push("/courses");
      router.refresh();
    } else {
      alert("Not authorized or failed to delete course.");
    }
  };

  // Determine which courses to display based on the selected tab
  const displayedCourses = selectedTab === "my-courses" ? myCourses : allCourses;

  // Filter courses based on search term
  const filteredCourses = displayedCourses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-foreground p-4">
      <div className="mb-8 text-center flex flex-col sm:flex-row justify-between items-center gap-16">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 transition-all duration-300 hover:text-blue-500 dark:hover:text-blue-300">
            Your Courses
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-80">
            Explore your course collection
          </p>
        </div>
        <div className="max-w-md w-full">
          <Tabs
            defaultValue="my-courses"
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full max-w-3xl mx-auto"
          >
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="my-courses" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                My Courses
              </TabsTrigger>
              <TabsTrigger value="all-courses" className="flex items-center gap-2">
                <Grid className="w-4 h-4" />
                All Courses
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 hover:scale-110" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 transition-all duration-200 hover:shadow-md focus:shadow-lg"
            />
          </div>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const firstVideoId = course.units[0]?.chapters[0]?.videoId;
            const thumbnailUrl = firstVideoId
              ? `https://img.youtube.com/vi/${firstVideoId}/hqdefault.jpg`
              : "https://via.placeholder.com/480x360?text=No+Video";

            // Only show delete button for user's own courses (my-courses tab)
            const showDeleteButton = selectedTab === "my-courses";

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/course/${course.id}/0/0`} passHref>
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="relative w-full h-48">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 hover:scale-105"
                        style={{ backgroundImage: `url(${thumbnailUrl})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent transition-opacity duration-300 hover:opacity-90" />
                    </div>

                    <div className="p-4 space-y-0 h-24">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full transition-colors duration-200 hover:bg-blue-100 dark:hover:bg-blue-800/50">
                            <Youtube className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                            YouTube
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCopyLink(course.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className="flex items-center justify-center h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                              title="Copy Course URL"
                            >
                              <Share className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                              <span className="hidden sm:inline ml-1">Share</span>
                            </Button>
                            {showDeleteButton && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDelete(course.id);
                                }}
                              >
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-2 line-clamp-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                          {course.name}
                        </h3>
                      </CardContent>

                      <CardFooter className="p-0 mt-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="transition-opacity duration-200 hover:opacity-80">
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
        <p className="text-center text-gray-600 dark:text-gray-300 transition-opacity duration-300 hover:opacity-80">
          {searchTerm
            ? "No courses match your search."
            : "No courses available yet."}
        </p>
      )}
    </div>
  );
};

export default Courses;