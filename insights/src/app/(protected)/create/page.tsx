import { getAuthSession } from "@/lib/auth";
import React from "react";
import { redirect } from "next/navigation";
import { InfoIcon } from "lucide-react";
import CreateCourseForm from "@/components/CreateCourseForm";
// import { checkSubscription } from "@/lib/subscription";

type Props = {};

const CreatePage = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/login");
  }
  const isPro = false; // await checkSubscription();
  return (
    <div className="flex flex-col items-center max-w-4xl px-4 mx-auto my-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8 transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-300">
        Create Your Learning Journey
      </h1>
      <div className="flex items-center p-6 mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
        <InfoIcon className="w-10 h-10 mr-4 text-blue-500 dark:text-blue-300 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-200" />
        <div className="text-gray-600 dark:text-gray-300 text-base leading-relaxed transition-opacity duration-200 hover:opacity-90">
          Enter a course title or what you want to learn about. Then add a list of units, which are the specifics you want to learn. Our AI will generate a tailored course for you!
        </div>
      </div>
      <CreateCourseForm isPro={isPro} />
    </div>
  );
};

export default CreatePage;