"use client";

import { useState } from "react";
import {
  Percent,
  BarChart2,
  Link,
  FileText,
  RefreshCw,
  Plus,
  Rocket,
  Users,
  SnailIcon as Nail,
  Zap,
  Heart,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AiNotesProps {
  videoId: string;
}

export default function AiNotes({ videoId }: AiNotesProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const regenerateNotes = () => {
    setIsGenerating(true);
    // Simulate API call to regenerate notes (replace with actual API)
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  // Mock data based on videoId (replace with Prisma fetch or API call)
  const notes = {
    summary: `In the video "${videoId}", Graham Weaver shares insights on living life at full power, emphasizing focus, energy management, relationships, learning, resilience, and purpose.`,
    highlights: [
      {
        icon: Rocket,
        color: "blue",
        text: "Focus is a key driver of productivity. When you're fully focused, productivity increases exponentially.",
      },
      {
        icon: Users,
        color: "green",
        text: "Your network is about who knows your capabilities. Build quality relationships for success.",
      },
      {
        icon: Nail,
        color: "yellow",
        text: "Continuous learning is essential for adapting to a rapidly changing world.",
      },
      {
        icon: Zap,
        color: "orange",
        text: "Resilience in setbacks determines long-term success. Learn from failures and move forward.",
      },
      {
        icon: Heart,
        color: "red",
        text: "Finding purpose fuels passion. Connect daily actions to a larger purpose for motivation.",
      },
      {
        icon: Rocket,
        color: "blue",
        text: "Focus is a key driver of productivity. When you're fully focused, productivity increases exponentially.",
      },
      {
        icon: Users,
        color: "green",
        text: "Your network is about who knows your capabilities. Build quality relationships for success.",
      },
      {
        icon: Nail,
        color: "yellow",
        text: "Continuous learning is essential for adapting to a rapidly changing world.",
      },
      {
        icon: Zap,
        color: "orange",
        text: "Resilience in setbacks determines long-term success. Learn from failures and move forward.",
      },
      {
        icon: Heart,
        color: "red",
        text: "Finding purpose fuels passion. Connect daily actions to a larger purpose for motivation.",
      },
    ],
    keyInsights: [
      {
        icon: Brain,
        color: "indigo",
        text: "Success is about working smarter, not harder, by focusing on high-impact activities and managing energy.",
      },
      {
        icon: Brain,
        color: "indigo",
        text: "Build a strong network by focusing on quality relationships with shared values.",
      },
      {
        icon: Brain,
        color: "indigo",
        text: "Resilience is a skill—reframe setbacks as growth opportunities to overcome challenges.",
      },
    ],
  };

  return (
    <div className="flex flex-col h-full overflow-auto"> {/* Added overflow-auto for scrollability */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Percent className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <BarChart2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Link className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <FileText className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={regenerateNotes}
            disabled={isGenerating}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            <span>Summarize</span>
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* General summary */}
        <div className="mb-6">
          <p className="text-sm mb-3">{notes.summary}</p>
        </div>

        {/* Highlights section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Highlights</h3>
          <div className="space-y-3">
            {notes.highlights.map((highlight, index) => (
              <div key={index} className="flex gap-3">
                <div className="mt-0.5">
                  <div className={`bg-${highlight.color}-500/20 p-1.5 rounded-md`}>
                    <highlight.icon className={`h-4 w-4 text-${highlight.color}-500`} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{highlight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Key insights section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Key Insights</h3>
          <div className="space-y-3">
            {notes.keyInsights.map((insight, index) => (
              <div key={index} className="flex gap-3">
                <div className="mt-0.5">
                  <div className={`bg-${insight.color}-500/20 p-1.5 rounded-md`}>
                    <insight.icon className={`h-4 w-4 text-${insight.color}-500`} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}