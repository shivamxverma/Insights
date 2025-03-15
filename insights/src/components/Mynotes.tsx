"use client";
import React, { useState, useEffect } from "react";
import { addMynotes, getNotes } from "@/lib/query"; // Adjust path as needed
import { Button } from "@/components/ui/button";
import {
  Bold,
  Code2,
  CodepenIcon,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo,
  Save,
  Strikethrough,
  Undo,
} from "lucide-react";
import { useDebounce } from "use-debounce";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";

interface MynotesProps {
  videoId: string;
  moduleId: string;
}

const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling bold");
          editor.chain().focus().toggleBold().run();
        }}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 ${
          editor.isActive("bold") ? "bg-blue-500/20 text-blue-500 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <Bold className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling italic");
          editor.chain().focus().toggleItalic().run();
        }}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 ${
          editor.isActive("italic") ? "bg-blue-500/20 text-blue-500 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <Italic className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling strike");
          editor.chain().focus().toggleStrike().run();
        }}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 ${
          editor.isActive("strike") ? "bg-blue-500/20 text-blue-500 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <Strikethrough className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling code");
          editor.chain().focus().toggleCode().run();
        }}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 ${
          editor.isActive("code") ? "bg-blue-500/20 text-blue-500 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <Code2 className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling heading 1");
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }}
        className={`transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 ${
          editor.isActive("heading", { level: 1 }) ? "bg-blue-500/20 text-blue-500 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <Heading1 className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling heading 2");
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        className={`transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 ${
          editor.isActive("heading", { level: 2 }) ? "bg-blue-500/20 text-blue-500 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <Heading2 className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling heading 3");
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className={`transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 ${
          editor.isActive("heading", { level: 3 }) ? "bg-blue-500/20 text-blue-500 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <Heading3 className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling heading 4");
          editor.chain().focus().toggleHeading({ level: 4 }).run();
        }}
        className={`transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 ${
          editor.isActive("heading", { level: 4 }) ? "bg-blue-500/20 text-blue-500 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <List className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling ordered list");
          editor.chain().focus().toggleOrderedList().run();
        }}
        className={`transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 ${
          editor.isActive("orderedList") ? "bg-blue-500/20 text-blue-500 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <ListOrdered className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling code block");
          editor.chain().focus().toggleCodeBlock().run();
        }}
        className={`transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 ${
          editor.isActive("codeBlock") ? "bg-blue-500/20 text-blue-500 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <CodepenIcon className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling blockquote");
          editor.chain().focus().toggleBlockquote().run();
        }}
        className={`transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 ${
          editor.isActive("blockquote") ? "bg-blue-500/20 text-blue-500 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <Quote className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Undo");
          editor.chain().focus().undo().run();
        }}
        disabled={!editor.can().chain().focus().undo().run()}
        className="transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 text-gray-700 dark:text-gray-300"
      >
        <Undo className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Redo");
          editor.chain().focus().redo().run();
        }}
        disabled={!editor.can().chain().focus().redo().run()}
        className="transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 text-gray-700 dark:text-gray-300"
      >
        <Redo className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
      </Button>
    </div>
  );
};

const Mynotes = ({ moduleId, videoId }: MynotesProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log("Editor updated:", html);
      setEditorState(html);
    },
    autofocus: true,
  });

  const [editorState, setEditorState] = useState("");
  const [debouncedEditorState] = useDebounce(editorState, 1000);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes(moduleId, videoId);
        if (data && editor) {
          console.log("Setting fetched notes:", data);
          editor.commands.setContent(data);
          setEditorState(data);
        }
      } catch (err) {
        console.error("Error fetching existing notes:", err);
      }
    };
    fetchNotes();
  }, [moduleId, videoId, editor]);

  useEffect(() => {
    if (debouncedEditorState && debouncedEditorState.trim() && debouncedEditorState !== "<p></p>" && !isSaving) {
      console.log("Auto-saving:", debouncedEditorState);
      handleSave();
    }
  }, [debouncedEditorState]);

  const handleSave = async () => {
    if (!editorState.trim() || editorState === "<p></p>") {
      setError("Please enter some notes before saving.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await addMynotes(editorState, moduleId, videoId);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save notes. Please try again.");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
      <div className="flex justify-between items-center mb-2 p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
          <Save className="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-200 hover:scale-110" />
          My Notes
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || !editor}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin transition-transform duration-200" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
              Save Now
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 flex flex-col border border-gray-200 dark:border-gray-600 rounded-md">
        {editor && <Toolbar editor={editor} />}
        <EditorContent
          editor={editor}
          className="flex-1 p-3 text-gray-700 dark:text-gray-200 overflow-y-auto prose prose-sm bg-white dark:bg-gray-800 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          placeholder="Write your notes here... (Auto-saves after 1 second)"
        />
      </div>

      <div className="mt-2 p-4 text-sm">
        {success && <span className="text-green-600 font-medium transition-opacity duration-200 hover:opacity-80">Notes saved successfully!</span>}
        {error && <span className="text-red-600 font-medium transition-opacity duration-200 hover:opacity-80">{error}</span>}
      </div>
    </div>
  );
};

export default Mynotes;