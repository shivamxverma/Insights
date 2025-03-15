"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  role: "USER" | "SYSTEM";
  content: string;
  createdAt: string;
}

interface AiChatProps {
  videoId: string;
  moduleId: string;
}

export default function AiChat({ moduleId, videoId }: AiChatProps) {
  console.log("Video ID:", videoId, "Module ID:", moduleId);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]); // Reset on videoId change
    const storedData = localStorage.getItem(`chat_${videoId}`);
    if (storedData) {
      const { messages: storedMessages, timestamp } = JSON.parse(storedData);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      if (now - timestamp < oneHour) {
        setMessages(storedMessages);
      } else {
        localStorage.removeItem(`chat_${videoId}`);
      }
    }
  }, [videoId]);

  useEffect(() => {
    if (messages.length > 0) {
      const data = { messages, timestamp: Date.now() };
      localStorage.setItem(`chat_${videoId}`, JSON.stringify(data));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "USER", content: input, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Sending query: ", moduleId, videoId);
      const res = await fetch("/api/retrival-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, namespace: videoId, moduleId: moduleId }),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const systemMessage: Message = {
        role: "SYSTEM",
        content: data.content || "No response content",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error("Failed to fetch response:", error);
      const errorMessage: Message = {
        role: "SYSTEM",
        content: "Failed to generate a response.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
          AI Chat Assistant
        </h1>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex items-center justify-center text-lg text-gray-500 dark:text-gray-400 transition-opacity duration-200 hover:opacity-80">
            Hello! Ask me about the video content.
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg shadow-sm border transition-all duration-200 ${
                    message.role === "USER"
                      ? "bg-blue-500 text-white border-blue-200 hover:bg-blue-600"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {message.role === "SYSTEM" ? (
                    <div className="space-y-3">
                      {message.content.split(/\n\n+/).map((section, idx) => {
                        const lines = section.split("\n").filter((line) => line.trim());
                        if (lines.length === 0) return null;
                        const heading = lines[0];
                        const details = lines.slice(1);
                        return details.length > 0 ? (
                          <div key={idx}>
                            <div className="text-base font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">{heading}</div>
                            {details.map((detail, i) => (
                              <p key={i} className="text-sm mt-1 text-gray-600 dark:text-gray-400 transition-opacity duration-200 hover:opacity-90">{detail}</p>
                            ))}
                          </div>
                        ) : (
                          <p key={idx} className="text-sm text-gray-600 dark:text-gray-400">{heading}</p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-white">{message.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 transition-opacity duration-200 hover:opacity-80">
                  <svg
                    className="w-5 h-5 animate-spin text-gray-500 dark:text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="4" opacity="0.3" />
                    <path d="M4 12a8 8 0 018-8v8h-8z" />
                  </svg>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the video..."
            className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 transition-all duration-200 hover:shadow-md focus:shadow-lg"
            aria-label="Chat input"
          />
          <Button
            type="submit"
            className="rounded-full p-3 bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label="Send message"
          >
            <Send className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
          </Button>
        </form>
      </footer>
    </div>
  );
}