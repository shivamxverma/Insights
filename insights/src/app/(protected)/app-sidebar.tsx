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

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "notes",
    url: "/notes",
    icon: Bot,
  },
  {
    title: "YT video",
    url: "/yt-video",
    icon: Bot,
  },
  {
      title: "Webpages/Articles",
      url: "/website-article",
      icon: Presentation,
    },
    {
      title: "Groups",
      url: "/groups",
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
      title: "tutorial",
      url: "",
      icon: Presentation,
    },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar()

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          {/* <Image src="/logo4.png" alt="logo" width={80} height={80} /> */}
          {open && (
            <h1  className="text-2xl font-extrabold text-primary/90 tracking-wide leading-tight drop-shadow-md">
             <Link href='/' >Insights</Link>
            </h1>
          )}
        </div>
        
      </SidebarHeader>

      <SidebarContent>
        {/* Application Section */}
        <SidebarGroup>
        <div className="flex items-center justify-between">
              <SidebarGroupLabel>Application</SidebarGroupLabel>
            </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ease-in-out",
                        pathname === item.url
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

              <div className="mt-4"> <br /> </div>
              <div className="flex items-center justify-between">
              <SidebarGroupLabel>Options</SidebarGroupLabel>
            </div>
            <SidebarMenu >
              {options.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ease-in-out",
                        pathname === item.url
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
          <Button className='w-full flex items-center gap-2 transition-colors duration-200 hover:bg-primary hover:text-white' variant="outline"  onClick={() => setOpen(!open)}>
                <ChevronLeft className={cn("h-4 w-4 transition-transform", open ? "" : "rotate-180")} />
              </Button>
    </Sidebar>
  );
}

