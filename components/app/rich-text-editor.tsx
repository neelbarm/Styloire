"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";
import { Bold, Italic, Link as LinkIcon } from "lucide-react";

// ─── Custom font-size mark (extends TextStyle's inline style) ────────────────
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }: { chain: () => any }) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
    } as any;
  },
});

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: "'Times New Roman', Times, serif" },
  { label: "Courier", value: "'Courier New', Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
];

const FONT_SIZES = [
  { label: "Size", value: "" },
  { label: "Small", value: "12px" },
  { label: "Normal", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "X-Large", value: "26px" },
];

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const toolbarBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-[0.3rem] border border-white/12 text-white/72 transition-colors hover:bg-white/10 hover:text-white";
const toolbarBtnActive = "bg-white/16 text-white border-white/30";
const selectCls =
  "h-8 rounded-[0.3rem] border border-white/12 bg-[#2a2a28] px-2 font-sans text-[0.78rem] text-white/80 focus:border-white/28 focus:outline-none";

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previous ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 px-2.5 py-2">
      <button
        type="button"
        title="Bold (Ctrl+B)"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${toolbarBtn} ${editor.isActive("bold") ? toolbarBtnActive : ""}`}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Italic (Ctrl+I)"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${toolbarBtn} ${editor.isActive("italic") ? toolbarBtnActive : ""}`}
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Add link"
        onClick={setLink}
        className={`${toolbarBtn} ${editor.isActive("link") ? toolbarBtnActive : ""}`}
      >
        <LinkIcon className="h-4 w-4" />
      </button>

      <span className="mx-1 h-5 w-px bg-white/12" />

      <select
        aria-label="Font family"
        className={selectCls}
        value={(editor.getAttributes("textStyle").fontFamily as string) ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v) editor.chain().focus().setFontFamily(v).run();
          else editor.chain().focus().unsetFontFamily().run();
        }}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.label} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Font size"
        className={selectCls}
        value={(editor.getAttributes("textStyle").fontSize as string) ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v) (editor.chain().focus() as any).setFontSize(v).run();
          else
            editor
              .chain()
              .focus()
              .setMark("textStyle", { fontSize: null })
              .run();
        }}
      >
        {FONT_SIZES.map((s) => (
          <option key={s.label} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      FontSize,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "tiptap-body min-h-[11rem] w-full px-3.5 py-3 font-sans text-[0.95rem] leading-relaxed text-styloire-champagneLight focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Treat truly-empty content as empty string (keeps validation/preview clean)
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Keep editor in sync if the value is reset externally (e.g. form reset)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (incoming !== current && incoming !== (current === "<p></p>" ? "" : current)) {
      editor.commands.setContent(incoming, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-[0.35rem] border border-white/12 bg-black/10 transition-colors focus-within:border-white/28">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
