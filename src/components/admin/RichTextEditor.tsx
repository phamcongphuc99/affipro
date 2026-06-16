"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
}

// Một nút trên thanh công cụ
function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // giữ vùng chọn
      onClick={onClick}
      title={title}
      className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const addLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập đường dẫn (URL):", prev || "https://");
    if (url === null) return; // hủy
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
  };

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2 rounded-t-lg">
      <ToolbarButton
        title="In đậm (Ctrl+B)"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <b>B</b>
      </ToolbarButton>
      <ToolbarButton
        title="In nghiêng (Ctrl+I)"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </ToolbarButton>
      <ToolbarButton
        title="Gạch chân / gạch ngang"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <s>S</s>
      </ToolbarButton>

      <span className="w-px bg-gray-300 mx-1" />

      <ToolbarButton
        title="Tiêu đề lớn"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="Tiêu đề nhỏ"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        title="Đoạn văn thường"
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        ¶
      </ToolbarButton>

      <span className="w-px bg-gray-300 mx-1" />

      <ToolbarButton
        title="Danh sách dấu chấm"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • Ds
      </ToolbarButton>
      <ToolbarButton
        title="Danh sách đánh số"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. Ds
      </ToolbarButton>
      <ToolbarButton
        title="Trích dẫn"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        ❝
      </ToolbarButton>

      <span className="w-px bg-gray-300 mx-1" />

      <ToolbarButton
        title="Chèn / sửa liên kết"
        active={editor.isActive("link")}
        onClick={addLink}
      >
        🔗
      </ToolbarButton>
      <ToolbarButton
        title="Đường kẻ ngang"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        ―
      </ToolbarButton>

      <span className="w-px bg-gray-300 mx-1" />

      <ToolbarButton
        title="Hoàn tác (Ctrl+Z)"
        onClick={() => editor.chain().focus().undo().run()}
      >
        ↶
      </ToolbarButton>
      <ToolbarButton
        title="Làm lại (Ctrl+Y)"
        onClick={() => editor.chain().focus().redo().run()}
      >
        ↷
      </ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, label }: Props) {
  const editor = useEditor({
    immediatelyRender: false, // tránh lỗi hydration với Next.js SSR
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose-content min-h-[260px] max-h-[600px] overflow-y-auto px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // TipTap trả về "<p></p>" khi rỗng -> coi như chuỗi rỗng
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Cập nhật nội dung khi prop value thay đổi từ bên ngoài (vd: tải dữ liệu sửa)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && value !== "") {
      // chỉ set khi khác để tránh nhảy con trỏ
      if (editor.getHTML() === "<p></p>" || editor.isEmpty) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="rounded-lg border border-gray-300 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 bg-white">
        {editor && <Toolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      <p className="mt-1 text-xs text-gray-400">
        Soạn thảo trực quan: bôi đen chữ rồi chọn định dạng. Enter để xuống dòng mới.
      </p>
    </div>
  );
}
