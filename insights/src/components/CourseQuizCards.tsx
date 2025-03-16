"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { CreateCourseQuizz } from "@/lib/courseQuery";

interface Quiz {
  id: string;
  videoId: string;
  question: string;
  answer: string;
  options: string; // JSON stringified array of options
}

interface Props {
  chapterId: string;
}

const CourseQuizCard: React.FC<Props> = ({ chapterId }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionState, setQuestionState] = useState<Record<string, boolean | null>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching quizzes for videoId:", chapterId);
      try {
        const res: Quiz[] | null = (await CreateCourseQuizz(chapterId))?.map((quiz: Quiz): Quiz => ({
          ...quiz,
          videoId: chapterId
        })) || [];
        if (res && Array.isArray(res)) {
          setQuizzes(res);
        } else {
          setError("Failed to load quizzes");
        }
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [chapterId]);

  const checkAnswer = () => {
    const newQuestionState = { ...questionState };
    quizzes.forEach((quiz) => {
      const userAnswer = answers[quiz.id];
      if (!userAnswer) return;
      newQuestionState[quiz.id] = userAnswer === quiz.answer;
    });
    setQuestionState(newQuestionState);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <svg
          className="w-6 h-6 animate-spin text-gray-500 dark:text-gray-400 transition-transform duration-200 hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="4" opacity="0.3" />
          <path d="M4 12a8 8 0 018-8v8h-8z" />
        </svg>
        <span className="text-gray-500 dark:text-gray-400 ml-2 transition-opacity duration-200 hover:opacity-80">Loading quizzes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 transition-opacity duration-200 hover:opacity-80 p-4">{error}</p>
    );
  }

  if (!quizzes.length) {
    return (
      <p className="text-gray-500 dark:text-gray-400 transition-opacity duration-200 hover:opacity-80 p-4">
        No quizzes available for this video.
      </p>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
        Quiz
      </h1>
      <div className="mt-2">
        {quizzes.map((quiz) => {
          const options = JSON.parse(quiz.options) as string[];
          return (
            <div
              key={quiz.id}
              className={cn(
                "p-3 mt-4 border border-gray-200 dark:border-gray-600 rounded-lg transition-all duration-200 hover:shadow-md",
                {
                  "bg-green-100 dark:bg-green-800/50": questionState[quiz.id] === true,
                  "bg-red-100 dark:bg-red-800/50": questionState[quiz.id] === false,
                  "bg-gray-50 dark:bg-gray-700": questionState[quiz.id] === null,
                }
              )}
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                {quiz.question}
              </h2>
              <div className="mt-2">
                <RadioGroup
                  onValueChange={(value) => {
                    setAnswers((prev) => ({
                      ...prev,
                      [quiz.id]: value,
                    }));
                  }}
                >
                  {options.map((option, index) => (
                    <div className="flex items-center space-x-2 p-2 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600" key={index}>
                      <RadioGroupItem
                        value={option}
                        id={`${quiz.id}-${index}`}
                        className="border border-gray-200 rounded-lg transition-transform duration-200 hover:scale-110"
                      />
                      <Label
                        htmlFor={`${quiz.id}-${index}`}
                        className="text-gray-700 dark:text-gray-300 transition-opacity duration-200 hover:opacity-80"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          );
        })}
      </div>
      <Button
        className="w-full mt-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all duration-300 hover:scale-105 hover:shadow-md"
        size="lg"
        onClick={checkAnswer}
      >
        Check Answers
        <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-200 hover:scale-110" />
      </Button>
    </div>
  );
};

export default CourseQuizCard;