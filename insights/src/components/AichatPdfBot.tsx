"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { chatPdfChatbot } from "@/lib/query";

interface Message {
  role: "USER" | "SYSTEM";
  content: string;
  createdAt: string;
}

interface AiChatProps {
  moduleId: string;
}

export default function AiChatPdfBot({ moduleId}: AiChatProps) {
  console.log("Video ID:", "Module ID:", moduleId);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]); // Reset on videoId change
    const storedData = localStorage.getItem(`chat_${moduleId}`);
    if (storedData) {
      const { messages: storedMessages, timestamp } = JSON.parse(storedData);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      if (now - timestamp < oneHour) {
        setMessages(storedMessages);
      } else {
        localStorage.removeItem(`chat_${moduleId}`);
      }
    }
  }, [moduleId]);

  useEffect(() => {
    if (messages.length > 0) {
      const data = { messages, timestamp: Date.now() };
      localStorage.setItem(`chat_${moduleId}`, JSON.stringify(data));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, moduleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "USER", content: input, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Sending query: ", moduleId);
      const res = await chatPdfChatbot(input, moduleId);
      if (!res) throw new Error(`API returned ${res}`);
      const systemMessage: Message = {
        role: "SYSTEM",
        content: res || "No response content",
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
    <div className="flex flex-col h-172 bg-background text-foreground rounded-lg shadow-lg border border-border">
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-10 bg-background border-b border-border">
        <h1 className="text-xl font-semibold">AI Chat Assistant</h1>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex items-center justify-center text-lg text-muted-foreground">
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
                  className={`max-w-[80%] p-4 rounded-lg shadow-sm border ${
                    message.role === "USER"
                      ? "bg-primary text-primary-foreground border-primary/20"
                      : "bg-muted text-foreground border-border"
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
                            <div className="text-base font-semibold">{heading}</div>
                            {details.map((detail, i) => (
                              <p key={i} className="text-sm mt-1">{detail}</p>
                            ))}
                          </div>
                        ) : (
                          <p key={idx} className="text-sm">{heading}</p>
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="p-4 rounded-lg shadow-sm border border-border bg-muted">
                  <svg
                    className="w-5 h-5 animate-spin text-muted-foreground"
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
      <footer className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the video..."
            className="flex-1 bg-background text-foreground border border-border placeholder-muted-foreground rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            aria-label="Chat input"
          />
          <Button
            type="submit"
            className="rounded-full p-3 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}