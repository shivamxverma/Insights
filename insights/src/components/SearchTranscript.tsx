// src/components/SearchTranscript.tsx
"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TranscriptItem {
  id: number;
  time: string;
  seconds: number;
  text: string;
}

interface SearchTranscriptProps {
  transcript: TranscriptItem[];
}

export default function SearchTranscript({ transcript }: SearchTranscriptProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter transcript based on search query
  const filteredTranscript = useMemo(() => {
    if (!searchQuery) return transcript;
    return transcript.filter((item) =>
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, transcript]);

  return (
    <div className="flex items-center gap-2 sticky top-0 bg-white z-10">
      <Search className="h-6 w-6 text-gray-500" />
      <Input
        type="search"
        placeholder="Search transcript"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      {searchQuery && (
        <p className="text-sm text-gray-500">
          {filteredTranscript.length} results found
        </p>
      )}
    </div>
  );
}