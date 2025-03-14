// app/web-scraping/page.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card } from "@/components/ui/card";

// Placeholder for theme toggle
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      {isDark ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
};

export default function WebScrapingPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Scraping URL:", url);
      // Placeholder for your web scraping logic
    } catch (err) {
      setError("Failed to scrape content");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="LearnerAI Logo" width={40} height={40} className="rounded-full" />
            <span className="text-xl font-bold text-foreground">LearnerAI</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/ai" className="text-sm font-medium hover:text-blue-500 transition">AI</Link>
            <Link href="/youtube" className="text-sm font-medium hover:text-blue-500 transition">YouTube</Link>
            <Link href="/presentation" className="text-sm font-medium hover:text-blue-500 transition">Presentation</Link>
            <Link href="/ai-pdf" className="text-sm font-medium hover:text-blue-500 transition">AI PDF</Link>
            <Link href="/study" className="text-sm font-medium hover:text-blue-500 transition">Study</Link>
            <Link href="/writer" className="text-sm font-medium hover:text-blue-500 transition">Writer</Link>
            <Link href="/ai-tools" className="text-sm font-medium hover:text-blue-500 transition">AI Tools</Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-blue-500 transition">Pricing</Link>
          </nav>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="outline" className="text-sm font-medium">Login</Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium">Sign Up</Button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">Web Scraping Summarizer</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Get webpage content and use AI to summarize web pages in one click for free online with LearnerAI’s Web Scraping tool.
        </p>
        <p className="text-base text-muted-foreground mb-8">
          Want to summarize local files?{" "}
          <Link href="/workspace" className="text-blue-500 hover:underline">Go to Workspace to summarize</Link>
        </p>

        <Card className="p-6 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 shadow-lg max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4">
            <Input
              type="url"
              placeholder="https://example.com..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-foreground"
              required
            />
            <div className="flex gap-3 w-full md:w-auto">
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3 rounded-lg w-full md:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate Summary"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 text-lg px-6 py-3 rounded-lg w-full md:w-auto"
              >
                Batch Summarize
              </Button>
            </div>
          </form>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <Image src="/web-example-1.png" alt="Example 1" width={150} height={100} className="rounded-lg shadow-sm" />
              <p className="text-sm text-muted-foreground mt-2">Welcome to LearnerAI</p>
              <p className="text-xs text-blue-500 mt-1">Web Scraping Guide</p>
            </div>
            <div className="flex flex-col items-center">
              <Image src="/web-example-2.png" alt="Example 2" width={150} height={100} className="rounded-lg shadow-sm" />
              <p className="text-sm text-muted-foreground mt-2">Tech Blog</p>
              <p className="text-xs text-blue-500 mt-1">Batch Summary Survey</p>
            </div>
            <div className="flex flex-col items-center">
              <Image src="/web-example-3.png" alt="Example 3" width={150} height={100} className="rounded-lg shadow-sm" />
              <p className="text-sm text-muted-foreground mt-2">Education Site</p>
            </div>
            <div className="flex flex-col items-center">
              <Image src="/web-example-4.png" alt="Example 4" width={150} height={100} className="rounded-lg shadow-sm" />
              <p className="text-sm text-muted-foreground mt-2">History Page</p>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="LearnerAI Logo" width={24} height={24} />
            <span className="text-sm font-medium">LearnerAI © 2025</span>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/about" className="text-sm hover:text-blue-500 transition">About</Link>
            <Link href="/privacy" className="text-sm hover:text-blue-500 transition">Privacy</Link>
            <Link href="/terms" className="text-sm hover:text-blue-500 transition">Terms</Link>
            <Link href="/contact" className="text-sm hover:text-blue-500 transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}