"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { retrieveAnswer } from "@/lib/retrieval";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AiChatProps {
  videoId: string;
}

const STORAGE_KEY = "ai_chat_messages";
const ONE_DAY = 24 * 60 * 60 * 1000;

export default function AiChat({ videoId }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedMessages = localStorage.getItem(STORAGE_KEY);
    if (storedMessages) {
      const parsedMessages: Message[] = JSON.parse(storedMessages);
      const recentMessages = parsedMessages.filter(
        (msg) => Date.now() - msg.timestamp < ONE_DAY
      );
      setMessages(recentMessages);
    } else {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: `Hi there! I'm your AI assistant for this video (${videoId}). Ask me anything!`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, [videoId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await retrieveAnswer(input, videoId);
      if (!response) throw new Error("Failed to fetch response");

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error fetching assistant response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background rounded-lg shadow-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Video Assistant</h2>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div key={message.id} className={cn("flex gap-3 mb-6", isUser ? "justify-end" : "justify-start")}>
              {!isUser && (
                <Avatar className="h-8 w-8 bg-primary/10 ring-1 ring-primary/20">
                  <AvatarFallback className="text-xs font-bold text-primary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex flex-col max-w-[80%]">
                <div className={cn("p-3 rounded-lg", isUser ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none")}>
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <div className={cn("text-xs text-muted-foreground mt-1", isUser ? "text-right" : "text-left")}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {isUser && (
                <Avatar className="h-8 w-8 bg-secondary/10 ring-1 ring-secondary/20">
                  <AvatarFallback className="text-xs font-bold text-secondary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 mb-6 justify-start">
            <Avatar className="h-8 w-8 bg-primary/10 ring-1 ring-primary/20">
              <AvatarFallback className="text-xs font-bold text-primary">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col max-w-[80%]">
              <div className="p-3 rounded-lg bg-muted text-foreground rounded-tl-none">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input type="text" placeholder="Ask about the video..." className="flex-1 min-h-[44px] bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary" value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} />
          <Button type="submit" disabled={!input.trim() || isLoading} className="h-[44px] px-4 bg-primary hover:bg-primary/90">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}