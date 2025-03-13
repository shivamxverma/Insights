"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/(protected)/app-sidebar";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CheckSquare, Clock, FileText, Folder, Slack, Zap, Calendar } from "lucide-react";

interface Module {
  id: string;
  name: string | null;
  videos: Video[];
  createdAt: Date;
}

interface Video {
  id: string;
  name: string | null;
  url: string;
  videoId: string;
  summary: string | null;
  transcript?: string | null;
}

export default function DashboardClient({ modules }: { modules: Module[] }) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-border bg-background">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="h-3 w-3 rounded-full bg-foreground/20"></span>
                <span className="h-3 w-3 rounded-full bg-foreground/20"></span>
                <span className="h-3 w-3 rounded-full bg-foreground/20"></span>
              </div>
              <h1 className="text-xl font-semibold">LearnHub</h1>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground">Features</a>
                <a href="#" className="hover:text-foreground">Solutions</a>
                <a href="#" className="hover:text-foreground">Resources</a>
                <a href="#" className="hover:text-foreground">Pricing</a>
              </nav>
              <Button variant="outline" className="border-border hover:bg-muted">
                Sign in
              </Button>
              <Button className="bg-foreground text-background hover:bg-foreground/80">
                Get demo
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center p-6">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                Learn, Plan, and Master All in One Place
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-6">
                Efficiently manage your learning and boost productivity.
              </p>
              <Button className="px-6 py-3 bg-foreground text-background hover:bg-foreground/80 font-semibold">
                Get free demo
              </Button>
            </div>

            {/* Floating Feature Cards */}
            <div className="relative w-full max-w-5xl h-[400px] md:h-[500px]">
              {/* Sticky Note */}
              <motion.div
                className="absolute top-[-40px] left-[-40px] w-64 bg-card p-4 rounded-lg shadow-md transform rotate-[-5deg]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-6 w-6 text-foreground" />
                  <h3 className="text-lg font-semibold">Take Notes</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep track of crucial details and manage tasks with ease.
                </p>
              </motion.div>

              {/* Reminder Card */}
              <motion.div
                className="absolute top-[80px] right-[-40px] w-64 bg-card p-4 rounded-lg shadow-md transform rotate-[5deg]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-6 w-6 text-foreground" />
                  <h3 className="text-lg font-semibold">Reminders</h3>
                </div>
                <p className="text-sm text-muted-foreground">Today’s Meeting</p>
                <p className="text-sm text-muted-foreground">Call with team</p>
                <p className="text-sm text-muted-foreground">13:00 - 13:45</p>
              </motion.div>

              {/* Tasks Card */}
              <motion.div
                className="absolute bottom-[-40px] left-[10%] w-64 bg-card p-4 rounded-lg shadow-md transform rotate-[3deg]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-6 w-6 text-foreground" />
                  <h3 className="text-lg font-semibold">Today’s Tasks</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">New ideas for campaign</p>
                    <p className="text-sm text-muted-foreground">60%</p>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div className="w-[60%] h-full bg-foreground/20 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Design PPT #4</p>
                    <p className="text-sm text-muted-foreground">12%</p>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div className="w-[12%] h-full bg-foreground/20 rounded-full"></div>
                  </div>
                </div>
              </motion.div>

              {/* Integrations Card */}
              <motion.div
                className="absolute bottom-[-60px] right-[5%] w-64 bg-card p-4 rounded-lg shadow-md transform rotate-[-3deg]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-6 w-6 text-foreground" />
                  <h3 className="text-lg font-semibold">100+ Integrations</h3>
                </div>
                <div className="flex gap-2">
                  <Slack className="h-8 w-8 text-foreground" />
                  <Calendar className="h-8 w-8 text-foreground" />
                  <Folder className="h-8 w-8 text-foreground" />
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}