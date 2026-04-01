"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import MenuBar from "./menu-bar";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import ImageResize from "tiptap-extension-resize-image";

interface Props {
    content: string;
    onChange: (value: string) => void;
}

export default function RichTextEditor({ content, onChange }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
                defaultAlignment: "left",
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            ImageResize, // Only ImageResize - it includes Image functionality
        ],

        content,
        immediatelyRender: false,

        editorProps: {
            attributes: {
                class: "ProseMirror min-h-[180px] p-2 bg-white rounded-b outline-none focus:outline-none",
            },
        },

        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Sync content from props → editor (prevents hydration issues & loops)
    useEffect(() => {
        if (!editor) return;

        const currentContent = editor.getHTML();
        if (content !== currentContent) {
            editor.commands.setContent(content, { emitUpdate: false }); // don't emit update
        }
    }, [content, editor]);

    return (
        <div className="rounded-md overflow-hidden">
            {editor && (
                <div className="sticky top-0 z-10">
                    <MenuBar editor={editor} />
                </div>
            )}

            <div className="max-h-[calc(100vh-390px)] overflow-y-auto custom-scrollbar">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
