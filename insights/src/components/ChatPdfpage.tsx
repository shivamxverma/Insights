"use client";

import { Upload } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

export default function ChatPdfPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 dark:from-gray-900 to-white dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 text-center transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
          ChatPDF Summarizer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 transition-opacity duration-200 hover:opacity-80">
          Get PDF content extracted and use AI to summarize PDF documents in one
          click for free online with Insights ChatPDF tool.
        </p>
        <p className="text-base text-gray-600 dark:text-gray-300 mb-8 transition-opacity duration-200 hover:opacity-80">
          Want to summarize local files?{" "}
          <a href="/workspace" className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors duration-200">
            Go to Workspace to summarize
          </a>
        </p>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-700 max-w-3xl mx-auto transition-all duration-200 hover:shadow-lg">
          <div
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 border-gray-300 hover:border-primary hover:bg-primary/5"
      >
        <Upload className="w-7 h-7 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 text-center">Drag & Drop your file here or Click to upload</p>
        <Button type="button" variant="outline" className="mt-4">
          Select File
        </Button>
      </div>
            <button
              className="bg-blue-500 mt-4 text-white px-6 py-3 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
            >
              Generate Summary
            </button>
          </div>
      </div>

      {/* How to Summarize ChatPDFs Section */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
            How to Summarize ChatPDFs?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 transition-opacity duration-200 hover:opacity-80">
            You can easily use ChatPDF AI summarizer with just 3 simple steps.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                Step1: Get PDF link or file
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-80">
                Upload or paste the PDF link or file into ChatPDF.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                Step2: Generate Summary
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-80">
                Click the "Generate Summary" button, and ChatPDF will process and
                summarize the PDF content.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                Step3: Read the summary
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-80">
                Read the concise summary, and save valuable time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}