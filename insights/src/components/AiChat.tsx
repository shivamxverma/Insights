"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Input } from "./ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  videoId: string;
}

export default function AiChat({ videoId }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hi there! I'm your AI assistant for this video. Ask me anything about "${videoId}" by Graham Weaver on living life at full power.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response after a delay (replace with API call)
    setTimeout(() => {
      const aiResponse = generateAiResponse(input, videoId);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // Generate AI response based on user query and videoId
  const generateAiResponse = (query: string, videoId: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("focus") || lowerQuery.includes("productivity")) {
      return "Graham Weaver emphasizes that focus is a key driver of productivity. When you're fully focused on a task, your productivity increases exponentially. He suggests eliminating distractions and practicing deep work to improve your focus.";
    } else if (lowerQuery.includes("energy") || lowerQuery.includes("time management")) {
      return "According to Graham, energy management is more important than time management. It's not about how many hours you work, but how much energy you bring to those hours. He recommends identifying your peak energy periods and scheduling your most important tasks during those times.";
    } else if (lowerQuery.includes("network") || lowerQuery.includes("relationship")) {
      return "Weaver believes that your network is not just about who you know, but who knows what you're capable of. Building strong relationships is essential for long-term success. He suggests focusing on quality over quantity in your professional relationships.";
    } else if (lowerQuery.includes("learning") || lowerQuery.includes("adapt")) {
      return "Continuous learning is essential in today's rapidly changing world, according to Graham. The most successful people are those who never stop learning and adapting. He recommends dedicating time each week to learning new skills and staying current in your field.";
    } else if (lowerQuery.includes("resilience") || lowerQuery.includes("failure") || lowerQuery.includes("setback")) {
      return "Graham emphasizes that resilience in the face of setbacks will determine your long-term success. Everyone faces failures, but not everyone learns from them and keeps moving forward. He suggests viewing failures as learning opportunities rather than personal deficiencies.";
    } else if (lowerQuery.includes("purpose") || lowerQuery.includes("passion")) {
      return "Finding purpose in your work will fuel your passion and drive, according to Weaver. When you connect your daily actions to a larger purpose, you'll find the motivation to excel. He recommends regularly reflecting on how your work contributes to your larger goals and values.";
    } else {
      return `In the video "${videoId}", Graham Weaver covers key principles for living life at full power: focus, energy management, building strong relationships, continuous learning, resilience, and finding purpose. Is there a specific aspect you'd like to know more about?`;
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto"> {/* Added overflow-auto for scrollability */}
      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 mb-4 ${message.role === "assistant" ? "" : "justify-end"}`}
          >
            {message.role === "assistant" && (
              <Avatar className="h-8 w-8 bg-primary/20">
                <div className="text-xs font-bold">AI</div>
              </Avatar>
            )}

            <div
              className={`max-w-[80%] p-3 rounded-lg ${message.role === "assistant" ? "bg-muted" : "bg-primary/20"}`}
            >
              <p className="text-sm">{message.content}</p>
              <div className="text-xs text-muted-foreground mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            {message.role === "user" && (
              <Avatar className="h-8 w-8 bg-primary/20">
                <div className="text-xs font-bold">You</div>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 mb-4">
            <Avatar className="h-8 w-8 bg-primary/20">
              <div className="text-xs font-bold">AI</div>
            </Avatar>
            <div className="max-w-[80%] p-3 rounded-lg bg-muted">
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div
                  className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          {/* <Textarea
            placeholder="Ask about the video content..."
            className="min-h-[60px] resize-none"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
          /> */}
          <Input type="text"
            placeholder="Ask about the video content..."
            className="min-h-[60px] resize-none"
            value={input}
            // onChange={handleInputChange}
            // onKeyDown={handleKeyPress}
           />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} className="h-auto">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}