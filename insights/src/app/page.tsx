// app/web-scraping/page.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import HomePage from "@/components/HomePage";
import { ModeToggle } from "../components/mode-toggle";
import ChatPdfPage from "@/components/ChatPdfpage";
import ArticleSummarizer from "@/components/articlesumarry";
import { Clock, BookOpen, User, Globe, Subtitles, FileText } from "lucide-react";
import CourseCreation from "@/components/createCourse";


export default function WebScrapingPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


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
              alt="InsightsAI Logo"
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
              { id: "home", label: "Home" },
              { id: "create", label: "CourseCreation" },
              { id: "youtube", label: "YouTube" },
              { id: "chatpdf", label: "ChatPdf" },
              { id: "article", label: "Website/Article" },
              { href: "/billing", label: "Billing" },
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
            <Link href="/create">
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
      <div id="create">
        <CourseCreation/>
      </div>


      {/* YouTube Video Summarizer Section */}
      <main id="youtube" className="container mx-auto px-4 py-16">
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
            YouTube Video Summarizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            Get YouTube transcript and use AI to summarize YouTube videos in one
            click for free online with Insights YouTube summary tool.
          </p>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-8">
            Want to summarize your Video's?{" "}
            <Link href="/create" className="text-blue-500 dark:text-blue-300 hover:underline">
              Go to Workspace to summarize
            </Link>
          </p>

          <Card className="p-6 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 shadow-lg max-w-3xl mx-auto">
            <form
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "Time-Saving",
                description:
                  "Get transcriptions and summaries in seconds, quickly decide if you want to continue watching, without any ads.",
              },
              {
                icon: BookOpen,
                title: "Perfect for Learning",
                description:
                  "Helps you understand videos through Highlights, Key Insights, Outline, Core Concepts, FAQs, AI Chat, and more.",
              },
              {
                icon: User,
                title: "Personalized for You",
                description:
                  "Customize summary prompts, depth, length, tone, and more to fit your needs.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <feature.icon className="h-8 w-8 mb-4 text-blue-500 dark:text-blue-300 transition-transform duration-200 hover:scale-110" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-opacity duration-200 hover:opacity-90">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          </Card>
        </section>

        {/* How to Summarize YouTube Videos Section */}
        <section className="mt-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
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
                className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
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
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transform hover:scale-105" >
              <div className="flex justify-center mb-4">
                <Image
                  src="/student-icon.svg" // Replace with actual icon path
                  alt="Student Icon"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                For Students
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enhance your studies by efficiently summarizing textbooks and
                research papers with ChatPDF.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transform hover:scale-105">
              <div className="flex justify-center mb-4 ">
                <Image
                  src="/professional-icon.png" // Replace with actual icon path
                  alt="Professional Icon"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                For Professionals
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Stay updated with key points of reports, manuals, and documents
                with ChatPDF summaries.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <Image
                  src="/learning (1).png" // Replace with actual icon path
                  alt="Researcher Icon"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
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
          <Link href="/create">
          <Button className="bg-white text-black px-6 py-3 rounded-lg hover:bg-blue-200 transition duration-200 transform hover:scale-105 dark:text-black">
            Try Insights for Free
          </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="LearnerAI Logo" width={40} height={40} />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Insights © 2025
            </span>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {[
              { href: "", label: "About" },
              { href: "", label: "Privacy" },
              { href: "", label: "Terms" },
              { href: "", label: "Contact" },
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