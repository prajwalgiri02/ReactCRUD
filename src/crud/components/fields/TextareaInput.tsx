"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Undo, Redo } from "lucide-react";

interface WysiwygInputProps {
  name: string;
  label: string;

  /** HTML string */
  value: string;

  /** returns HTML string */
  onChange: (value: string) => void;

  error?: string;
  placeholder?: string;
  disabled?: boolean;
  minHeightPx?: number;
}

export function WysiwygInput({
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  minHeightPx = 160,
}: WysiwygInputProps) {
  const editor = useEditor({
     immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? "Write something…",
      }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        id: name,
        class:
          "prose prose-sm max-w-none focus:outline-none px-3 py-2",
      },
    },
  });

  // If parent changes `value` (e.g. edit form loads), sync editor content.
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next) editor.commands.setContent(next, false);
  }, [value, editor]);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <div
        className={cn(
          "rounded-md border bg-background ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          error && "border-destructive focus-within:ring-destructive",
          disabled && "opacity-70"
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b p-2">
          <ToolbarButton
            pressed={!!editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor || disabled}
            icon={<Bold className="h-4 w-4" />}
          />
          <ToolbarButton
            pressed={!!editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor || disabled}
            icon={<Italic className="h-4 w-4" />}
          />
          <ToolbarButton
            pressed={!!editor?.isActive("strike")}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            disabled={!editor || disabled}
            icon={<Strikethrough className="h-4 w-4" />}
          />

          <div className="mx-1 h-5 w-px bg-border" />

          <ToolbarButton
            pressed={!!editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={!editor || disabled}
            icon={<List className="h-4 w-4" />}
          />
          <ToolbarButton
            pressed={!!editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            disabled={!editor || disabled}
            icon={<ListOrdered className="h-4 w-4" />}
          />
          <ToolbarButton
            pressed={!!editor?.isActive("blockquote")}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            disabled={!editor || disabled}
            icon={<Quote className="h-4 w-4" />}
          />

          <div className="mx-1 h-5 w-px bg-border" />

          <ToolbarButton
            pressed={false}
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor || disabled || !editor.can().undo()}
            icon={<Undo className="h-4 w-4" />}
          />
          <ToolbarButton
            pressed={false}
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor || disabled || !editor.can().redo()}
            icon={<Redo className="h-4 w-4" />}
          />
        </div>

        {/* Editor */}
        <div style={{ minHeight: minHeightPx }}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function ToolbarButton({
  icon,
  pressed,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  pressed: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={pressed ? "secondary" : "ghost"}
      size="icon"
      className="h-8 w-8"
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </Button>
  );
}
