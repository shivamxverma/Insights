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
  Heading4,
  Heading5,
  Heading6,
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
    <div className="flex flex-wrap gap-2 p-2 bg-gray-100 border-b border-gray-200 rounded-t-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling bold");
          editor.chain().focus().toggleBold().run();
        }}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-cyan-200" : ""}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling italic");
          editor.chain().focus().toggleItalic().run();
        }}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-cyan-200" : ""}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling strike");
          editor.chain().focus().toggleStrike().run();
        }}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "bg-cyan-200" : ""}
      >
        <Strikethrough className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling code");
          editor.chain().focus().toggleCode().run();
        }}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? "bg-cyan-200" : ""}
      >
        <Code2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling heading 1");
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }}
        className={editor.isActive("heading", { level: 1 }) ? "bg-cyan-200" : ""}
      >
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling heading 2");
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        className={editor.isActive("heading", { level: 2 }) ? "bg-cyan-200" : ""}
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling heading 3");
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className={editor.isActive("heading", { level: 3 }) ? "bg-cyan-200" : ""}
      >
        <Heading3 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling heading 4");
          editor.chain().focus().toggleHeading({ level: 4 }).run();
        }}
        className={editor.isActive("heading", { level: 4 }) ? "bg-cyan-200" : ""}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling ordered list");
          editor.chain().focus().toggleOrderedList().run();
        }}
        className={editor.isActive("orderedList") ? "bg-cyan-200" : ""}
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling code block");
          editor.chain().focus().toggleCodeBlock().run();
        }}
        className={editor.isActive("codeBlock") ? "bg-cyan-200" : ""}
      >
        <CodepenIcon className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Toggling blockquote");
          editor.chain().focus().toggleBlockquote().run();
        }}
        className={editor.isActive("blockquote") ? "bg-cyan-200" : ""}
      >
        <Quote className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Undo");
          editor.chain().focus().undo().run();
        }}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Redo");
          editor.chain().focus().redo().run();
        }}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo className="w-4 h-4" />
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
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Save className="w-5 h-5 text-gray-600" />
          My Notes
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || !editor}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Now
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 flex flex-col border border-gray-300 rounded-md">
        {editor && <Toolbar editor={editor} />}
        <EditorContent
          editor={editor}
          className="flex-1 p-3 text-gray-700 overflow-y-auto prose prose-sm"
          placeholder="Write your notes here... (Auto-saves after 1 second)"
        />
      </div>

      <div className="mt-2 text-sm">
        {success && <span className="text-green-600 font-medium">Notes saved successfully!</span>}
        {error && <span className="text-red-600 font-medium">{error}</span>}
      </div>
    </div>
  );
};

export default Mynotes;