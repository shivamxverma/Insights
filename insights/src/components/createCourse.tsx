
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export default function CourseCreation() {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header Section */}
      <section className="py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
          Create Your Own Course
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Build personalized courses with units and chapters, and share them with others using our intuitive course creation tool.
        </p>
        <a
          href="/create"
          className="mt-6 inline-block text-blue-600 dark:text-blue-400 hover:underline"
        >
          Want to manage your courses? Go to Workspace
        </a>
      </section>

      {/* Input Section */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <Input
            type="text"
            placeholder="Enter course title to start..."
            className="flex-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Start Creating
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">User-Driven Content</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create courses tailored to your expertise, with full control over units and chapters.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="text-3xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">Collaborative Sharing</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Share your courses with others, enabling collaborative learning and knowledge exchange.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">Personalized Learning</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Design courses that fit your audience's needs, with AI-enhanced content and quizzes.
            </p>
          </div>
        </div>
      </section>

      {/* How-To Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300 text-center">
          How to Create a Course?
        </h2>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          You can easily create a course in just 3 simple steps.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">Step 1: Define Course Details</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter the course title, description, and set the structure for units and chapters.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">Step 2: Add Units and Chapters</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create units, add chapters with videos, and enhance with AI-generated content.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">Step 3: Share with Others</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Publish your course and share it with learners or collaborators effortlessly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}