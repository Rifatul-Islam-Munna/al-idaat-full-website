"use client";

import {
    LuAlignCenter,
    LuAlignLeft,
    LuAlignRight,
    LuBold,
    LuHeading1,
    LuHeading2,
    LuHeading3,
    LuItalic,
    LuList,
    LuListOrdered,
    LuStrikethrough,
    LuLink,
    LuImage,
} from "react-icons/lu";

import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface Props {
    editor: Editor | null;
}

export default function MenuBar({ editor }: Props) {
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        if (!editor) return;

        const rerender = () => forceUpdate((v) => v + 1);

        editor.on("update", rerender);
        editor.on("selectionUpdate", rerender);

        return () => {
            editor.off("update", rerender);
            editor.off("selectionUpdate", rerender);
        };
    }, [editor]);

    if (!editor) return null;

    const baseBtn = "p-1.5 rounded transition-colors duration-150 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400";
    const activeStyle = "bg-red-500 text-white shadow-sm";
    const inactiveStyle = "bg-gray-200 text-gray-800 hover:bg-gray-300";

    // Helper function for link action
    const handleLinkClick = async () => {
        if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
        }

        const { value } = await Swal.fire({
            title: "Enter URL",
            input: "url",
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) return "URL is required";
                try {
                    new URL(value);
                    return null;
                } catch {
                    return "Please enter a valid URL";
                }
            },
        });

        if (value) {
            editor.chain().focus().setLink({ href: value }).run();
        }
    };

    // Helper function for image action
    const handleImageClick = async () => {
        const { value } = await Swal.fire({
            title: "Enter Image URL",
            input: "url",
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) return "URL is required";
                try {
                    new URL(value);
                    return null;
                } catch {
                    return "Please enter a valid URL";
                }
            },
        });

        if (value) {
            editor.chain().focus().insertContent(`<img src="${value}" />`).run();
        }
    };

    return (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-100 border-b border-border rounded-t">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`${baseBtn} ${editor.isActive("heading", { level: 1 }) ? activeStyle : inactiveStyle}`}
                title="H1"
            >
                <LuHeading1 className="size-5" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`${baseBtn} ${editor.isActive("heading", { level: 2 }) ? activeStyle : inactiveStyle}`}
                title="H2"
            >
                <LuHeading2 className="size-5" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`${baseBtn} ${editor.isActive("heading", { level: 3 }) ? activeStyle : inactiveStyle}`}
                title="H3"
            >
                <LuHeading3 className="size-5" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`${baseBtn} ${editor.isActive("bold") ? activeStyle : inactiveStyle}`}
                title="Bold"
            >
                <LuBold className="size-5" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`${baseBtn} ${editor.isActive("italic") ? activeStyle : inactiveStyle}`}
                title="Italic"
            >
                <LuItalic className="size-5" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`${baseBtn} ${editor.isActive("strike") ? activeStyle : inactiveStyle}`}
                title="Strike"
            >
                <LuStrikethrough className="size-5" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                className={`${baseBtn} ${editor.isActive({ textAlign: "left" }) ? activeStyle : inactiveStyle}`}
                title="Align Left"
            >
                <LuAlignLeft className="size-5" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                className={`${baseBtn} ${editor.isActive({ textAlign: "center" }) ? activeStyle : inactiveStyle}`}
                title="Align Center"
            >
                <LuAlignCenter className="size-5" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                className={`${baseBtn} ${editor.isActive({ textAlign: "right" }) ? activeStyle : inactiveStyle}`}
                title="Align Right"
            >
                <LuAlignRight className="size-5" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`${baseBtn} ${editor.isActive("bulletList") ? activeStyle : inactiveStyle}`}
                title="Bullet List"
            >
                <LuList className="size-5" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`${baseBtn} ${editor.isActive("orderedList") ? activeStyle : inactiveStyle}`}
                title="Ordered List"
            >
                <LuListOrdered className="size-5" />
            </button>

            <button
                type="button"
                onClick={handleLinkClick}
                className={`${baseBtn} ${editor.isActive("link") ? activeStyle : inactiveStyle}`}
                title="Link"
            >
                <LuLink className="size-5" />
            </button>

            <button type="button" onClick={handleImageClick} className={`${baseBtn} ${inactiveStyle}`} title="Image">
                <LuImage className="size-5" />
            </button>
        </div>
    );
}
