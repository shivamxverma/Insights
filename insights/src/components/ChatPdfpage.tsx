// app/chat-pdf/page.tsx
import Image from "next/image";

export default function ChatPdfPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          ChatPDF Summarizer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Get PDF content extracted and use AI to summarize PDF documents in one
          click for free online with NoteGPT’s ChatPDF tool.
        </p>
        <p className="text-base text-gray-600 dark:text-gray-300 mb-8">
          Want to summarize local files?{" "}
          <a href="/workspace" className="text-blue-600 dark:text-blue-300 hover:underline">
            Go to Workspace to summarize
          </a>
        </p>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-blue-200 dark:border-blue-700 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="https://example.com/your-pdf-link"
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:outline-none"
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full md:w-auto">
              Generate Summary
            </button>
            <button className="bg-white text-blue-600 dark:bg-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg border border-blue-600 dark:border-blue-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition w-full md:w-auto">
              Batch Summarize
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <Image
                src="/pdf-example-1.png"
                alt="Example 1"
                width={150}
                height={100}
                className="rounded-lg shadow-sm"
              />
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                PDF Guide
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                ChatPDF Subscription
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/pdf-example-2.png"
                alt="Example 2"
                width={150}
                height={100}
                className="rounded-lg shadow-sm"
              />
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Research Paper
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Batch Summary Survey
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/pdf-example-3.png"
                alt="Example 3"
                width={150}
                height={100}
                className="rounded-lg shadow-sm"
              />
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Manual
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/pdf-example-4.png"
                alt="Example 4"
                width={150}
                height={100}
                className="rounded-lg shadow-sm"
              />
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Report
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How to Summarize ChatPDFs Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            How to Summarize ChatPDFs?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            You can easily use ChatPDF AI summarizer with just 3 simple steps.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Step1: Get PDF link or file
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload or paste the PDF link or file into ChatPDF.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Step2: Generate Summary
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Click the "Generate Summary" button, and ChatPDF will process and
                summarize the PDF content.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Step3: Read the summary
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Read the concise summary, and save valuable time.
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}