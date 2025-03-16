"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bot, CreditCard, LayoutDashboard, Presentation, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";

const items = [
  {
    title: "Create",
    url: "/create",
    icon: LayoutDashboard,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Modules",
    url: "/modules",
    icon: Bot,
  },
  {
    title: "Webpages/Articles",
    url: "/website-article",
    icon: Presentation,
  },
  {
    title: "Documents",
    url: "/document",
    icon: Bot,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];

const options = [
  {
    title: "Community",
    url: "",
    icon: LayoutDashboard,
  },
  {
    title: "Feedback",
    url: "",
    icon: Bot,
  },
  {
    title: "Tutorial",
    url: "",
    icon: Presentation,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="floating" className="bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Insights"
            width={40}
            height={40}
            className="rounded-full"
          />
          {open && (
            <>
              <h1 className="text-2xl font-extrabold text-blue-500 dark:text-blue-300 tracking-wide leading-tight drop-shadow-md transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-200">
                <Link href='/dashboard'>Insights</Link>
              </h1>
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Application Section */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-4">
            <SidebarGroupLabel className="text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
              Application
            </SidebarGroupLabel>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-all duration-200 ease-in-out",
                        pathname === item.url
                          ? "bg-blue-500 text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-300"
                      )}
                    >
                      <item.icon className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <div className="mt-4">
              <br />
            </div>
            <div className="flex items-center justify-between px-4">
              <SidebarGroupLabel className="text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                Options
              </SidebarGroupLabel>
            </div>
            <SidebarMenu>
              {options.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-all duration-200 ease-in-out",
                        pathname === item.url
                          ? "bg-blue-500 text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-300"
                      )}
                    >
                      <item.icon className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Button
        className="w-full flex items-center gap-2 transition-all duration-300 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white hover:shadow-md"
        variant="outline"
        onClick={() => setOpen(!open)}
      >
        <ChevronLeft
          className={cn("h-4 w-4 transition-transform duration-200", open ? "" : "rotate-180")}
        />
      </Button>
    </Sidebar>
  );
}