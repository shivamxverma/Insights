// app/web-scraping/page.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import HomePage from "@/components/HomePage";
import { ModeToggle } from "./(protected)/mode-toggle";
import ChatPdfPage from "@/components/ChatPdfpage";
import ArticleSummarizer from "@/components/articlesumarry";

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="LearnerAI Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Insights
            </span>
          </div>
          <nav className="hidden md:flex space-x-6">
            {[
              { id: "home", label: "AI" },
              { id: "youtube", label: "YouTube" },
              { id: "chatpdf", label: "ChatPdf" },
              { id: "article", label: "Website/Article" },
              { href: "/pricing", label: "Pricing" },
            ].map((link) => (
              link.href ? (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300 transition"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.id}
                  onClick={() => link.id && scrollToSection(link.id)}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300 transition cursor-pointer"
                >
                  {link.label}
                </button>
              )
            ))}
          </nav>
          <div className="flex items-center space-x-3">
            <ModeToggle />
            <Link href="/login">
            <Button
              variant="outline"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Login
            </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div id="home">
        <HomePage />
      </div>

      {/* YouTube Video Summarizer Section */}
      <main id="youtube" className="container mx-auto px-4 py-16">
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 leading-tight mb-6">
            YouTube Video Summarizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            Get YouTube transcript and use AI to summarize YouTube videos in one
            click for free online with Insights YouTube summary tool.
          </p>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-8">
            Want to summarize local Video/Audio files?{" "}
            <Link href="/workspace" className="text-blue-500 dark:text-blue-300 hover:underline">
              Go to Workspace to summarize
            </Link>
          </p>

          <Card className="p-6 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 shadow-lg max-w-3xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col md:flex-row items-center gap-4"
            >
              <Input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
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
                  className="border-blue-500 text-blue-500 dark:border-blue-300 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 text-lg px-6 py-3 rounded-lg w-full md:w-auto"
                >
                  Batch Summarize
                </Button>
              </div>
            </form>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { src: "/youtube-example-1.png", title: "Insights Guide", subtitle: "YouTube Subscription" },
                { src: "/youtube-example-2.png", title: "Tech Video", subtitle: "YouTube Batch Summary" },
                { src: "/youtube-example-3.png", title: "TED Talk" },
                { src: "/youtube-example-4.png", title: "History Video" },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Image
                    src={item.src}
                    alt={`Example ${index + 1}`}
                    width={150}
                    height={100}
                    className="rounded-lg shadow-sm"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* How to Summarize YouTube Videos Section */}
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            How to Summarize YouTube Videos?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            You can easily use YouTube AI summarizer with just 3 simple steps.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Step 1: Get YouTube video link",
                description: "Copy and paste the YouTube video link into Insights.",
              },
              {
                title: "Step 2: Generate Summary",
                description:
                  "Click the 'Generate Summary' button, and Insights will fetch the transcript and summarize the YouTube video.",
              },
              {
                title: "Step 3: Read the AI summary",
                description: "Read the concise summary, and save valuable time.",
              },
            ].map((step, index) => (
              <Card
                key={index}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Additional Sections */}
      <div id="chatpdf">
        <ChatPdfPage />
      </div>
      
      <div id="article">
        <ArticleSummarizer />
      </div>

      {/* Use Cases for Different Roles Section */}
      <section className="py-16 bg-blue-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Use Cases for Different Roles
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Made for students, professionals, or PDF enthusiasts of all kind
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-center mb-4">
                <Image
                  src="/student-icon.png" // Replace with actual icon path
                  alt="Student Icon"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                For Students
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enhance your studies by efficiently summarizing textbooks and
                research papers with ChatPDF.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-center mb-4">
                <Image
                  src="/professional-icon.png" // Replace with actual icon path
                  alt="Professional Icon"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                For Professionals
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Stay updated with key points of reports, manuals, and documents
                with ChatPDF summaries.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-center mb-4">
                <Image
                  src="/researcher-icon.png" // Replace with actual icon path
                  alt="Researcher Icon"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                For Researchers
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Efficiently explore and digest a vast collection of PDF materials
                with ChatPDF.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-blue-300 dark:from-blue-800 dark:to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Start saving time and effort today! Summarize YouTube videos effortlessly with Insights.
          </h2>
          <Button className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition">
            Try Insights for Free
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="LearnerAI Logo" width={40} height={40} />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              LearnerAI © 2025
            </span>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {[
              { href: "/about", label: "About" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}