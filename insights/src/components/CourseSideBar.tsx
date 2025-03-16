"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Play, LayoutDashboard } from "lucide-react";
import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";

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
}

interface Props {
  course: Course;
  unitIndex: number;
  currentChapterIndex: number;
}

const CourseSideBar = ({ course, unitIndex, currentChapterIndex }: Props) => {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();

  const isActive = (uIndex: number, chIndex: number) => pathname === `/course/${course.id}/${uIndex}/${chIndex}`;

  return (
    <Sidebar collapsible="icon" variant="floating" className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Image
            src="/logo.png"
            alt="Insights"
            width={40}
            height={40}
            className="rounded-full"
          />
          {open && (
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-wide leading-tight drop-shadow-md transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
              <Link href={`/dashboard`}>Insights</Link>
            </h1>
          )}
        </div>
      </SidebarHeader>

      <Button
        className="w-full flex items-center gap-2 p-2 mt-2 mb-4 transition-all duration-200 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white hover:shadow-md"
        variant="outline"
        onClick={() => window.location.href = "/modules"}
        aria-label={open ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        <LayoutDashboard className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        {open && <span className="transition-opacity duration-200 hover:opacity-80">Modules</span>}
      </Button>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {course.units.map((unit, uIndex) => (
                <React.Fragment key={unit.id}>
                  {open && (
                    <div className="px-2 py-1 text-sm uppercase text-blue-500 dark:text-gray-400 transition-colors duration-200 hover:text-blue-800 dark:hover:text-blue-300">
                      Unit {uIndex + 1}: {unit.name}
                    </div>
                  )}
                  {unit.chapters.map((chapter, chIndex) => (
                    <SidebarMenuItem key={chapter.id}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={`/course/${course.id}/${uIndex}/${chIndex}`}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md transition-all duration-200",
                            isActive(uIndex, chIndex)
                              ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm"
                          )}
                          aria-label={`Go to ${chapter.name}`}
                        >
                          <Play className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                          <span className="truncate flex-1 transition-opacity duration-200 hover:opacity-80">
                            {chapter.name}
                          </span>
                          {isActive(uIndex, chIndex) && open && (
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full transition-opacity duration-200 hover:opacity-80">
                              Active
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Button
        className="w-full flex items-center gap-2 p-2 transition-all duration-200 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white hover:shadow-md"
        variant="outline"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform duration-200", open ? "" : "rotate-180")} />
        {open && <span className="transition-opacity duration-200 hover:opacity-80">{open ? "Collapse" : "Expand"}</span>}
      </Button>
    </Sidebar>
  );
};

export default CourseSideBar;