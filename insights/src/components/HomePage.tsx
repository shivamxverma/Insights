// app/page.tsx
import Image from "next/image";

export default function HomePage() {
  return (
    <div  className=" min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Section: Text Content */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            AI Summarizer & Generator <br /> for Enhanced Learning
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
            Insights - YouTube Video Summarizer, PDF Summary, PPT Summary, Image
            Summaries, and more. Create PPTs, Mindmaps, and Notes with Insights AI
            to improve your learning efficiency by 10x.
          </p>
          <div className="flex justify-center lg:justify-start gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition">
              Get Started Free
            </button>
            <button className="bg-white text-blue-600 dark:bg-gray-700 dark:text-gray-200 px-6 py-3 rounded-full border border-blue-600 dark:border-blue-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
              Add to Chrome - It's Free
            </button>
          </div>
          <div className="mt-8 flex justify-center lg:justify-start gap-4 flex-wrap">
            {["YouTube", "Udemy", "Coursera", "Vimeo", "Bilibili", "Google", "Quizlet", "CRAM"].map((platform) => (
              <span key={platform} className="text-blue-600 dark:text-blue-300 text-sm">
                {platform}
              </span>
            ))}
          </div>
        </div>

        {/* Right Section: Image and Mockup */}
        <div className="lg:w-1/2 relative">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 rounded-full"></span>
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Insights</span>
              </div>
              <button className="text-blue-600 dark:text-blue-300 text-sm">New AI Summary</button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex gap-2 mb-4">
                <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300">My Notes</button>
                <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300">URL</button>
                <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300">Upload</button>
                <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300">Text</button>
              </div>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <input
                  type="text"
                  placeholder="https://example.com/your-url"
                  className="w-full p-2 border-none bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
                />
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Summarize Now
                </button>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="text-green-600 dark:text-green-400">✔ YouTube Video Links</span>
                <span className="text-green-600 dark:text-green-400">✔ Podcasts</span>
                <span className="text-green-600 dark:text-green-400">✔ Online Articles</span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Mind Map</h3>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 h-32 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Mind Map Placeholder
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Summary to enhance your YouTube videos with Insights to efficiently
                learn and improve efficiency
              </div>
              <div className="mt-4 bg-blue-800 text-white p-2 rounded flex justify-between items-center">
                <span>Heighten Efficiency</span>
                <span className="text-sm">Save 60%</span>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-500 rounded-full opacity-20"></div>
        </div>
      </div>
    </div>
  );
}