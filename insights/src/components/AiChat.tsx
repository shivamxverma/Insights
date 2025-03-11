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
  moduleId : string;
}

export default function AiChat({ moduleId, videoId }: AiChatProps) {
  console.log("Video ID:", videoId , "Module ID:", moduleId);
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
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Sending query: ", moduleId , videoId);
      const res = await fetch("/api/retrival-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, namespace: videoId , moduleId : moduleId }),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const systemMessage: Message = {
        role: "SYSTEM",
        content: data.content || "No response content",
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, systemMessage]);
    } catch (error) {
      console.error("Failed to fetch response:", error);
      const errorMessage: Message = {
        role: "SYSTEM",
        content: "Failed to generate a response.",
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" text-black rounded-lg shadow-lg">
      <header className="p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-2xl font-semibold ">AI Chat</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex items-center justify-center text-lg">
            Hello! Ask me about instrumentation and controls for construction projects.
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3xl p-4 rounded-lg shadow-md border  ${
                    message.role === "USER"
                      ? "bg-[#0A2A3F]/80 text-white"
                      : "bg-[#072024]/80 text-white"
                  }`}
                >
                  {message.role === "SYSTEM" ? (
                    <div className="space-y-4">
                      {message.content.split(/\n\n+/).map((section, idx) => {
                        const lines = section.split("\n").filter(line => line.trim());
                        if (lines.length === 0) return null;
                        const heading = lines[0];
                        const details = lines.slice(1);
                        return details.length > 0 ? (
                          <div key={idx}>
                            <div className="text-lg font-semibold ">{heading}</div>
                            {details.map((detail, i) => (
                              <p key={i} className="text-sm  mt-1">{detail}</p>
                            ))}
                          </div>
                        ) : (
                          <p key={idx} className="text-sm ">{heading}</p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-lg shadow-md border ">
                  <svg className="w-5 h-5 animate-spin " viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                  </svg>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <footer className="p-6 ">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about instrumentation and controls..."
            className="flex-1  text-white border-cyan-500/30  placeholder-zinc-500 rounded-lg p-3 text-sm"
          />
          <Button
            type="submit"
            className=" rounded-full p-3"
            disabled={isLoading}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}