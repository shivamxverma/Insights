// components/QuizCard.tsx
"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Quiz {
  id: string;
  videoId: string;
  question: string;
  answer: string;
  options: string; // JSON stringified array of options
}

interface Props {
  videoId: string;
}

const QuizCard: React.FC<Props> = ({ videoId }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionState, setQuestionState] = useState<Record<string, boolean | null>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching quizzes for videoId:", videoId); // Add debug
      try {
        const res = await fetch("/api/getQuiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId: videoId || "" }), // Ensure videoId is sent
        });
        const data = await res.json();
        if (res.ok) {
          setQuizzes(data.questions || []);
        } else {
          setError(data.error || "Failed to load quizzes");
        }
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [videoId]);

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
    return <p className="text-gray-500">Loading quizzes...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!quizzes.length) {
    return <p className="text-gray-500">No quizzes available for this video.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>
      <div className="mt-2">
        {quizzes.map((quiz) => {
          const options = JSON.parse(quiz.options) as string[];
          return (
            <div
              key={quiz.id}
              className={cn("p-3 mt-4 border border-secondary rounded-lg", {
                "bg-green-700": questionState[quiz.id] === true,
                "bg-red-700": questionState[quiz.id] === false,
                "bg-secondary": questionState[quiz.id] === null,
              })}
            >
              <h2 className="text-lg font-semibold">{quiz.question}</h2>
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
                    <div className="flex items-center space-x-2" key={index}>
                      <RadioGroupItem
                        value={option}
                        id={`${quiz.id}-${index}`}
                      />
                      <Label htmlFor={`${quiz.id}-${index}`}>
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
      <Button className="w-full mt-4" size="lg" onClick={checkAnswer}>
        Check Answers
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

export default QuizCard;