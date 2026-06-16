"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import RichTextEditor from "./RichTextEditor";

interface PostData {
  id?: number;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  published?: boolean;
}

export default function PostForm({ post }: { post?: PostData }) {
  const router = useRouter();
  const isEdit = !!post?.id;

  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    coverImage: post?.coverImage || "",
    published: post?.published ?? true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const url = isEdit ? `/api/posts/${post!.id}` : "/api/posts";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Lưu thất bại.");
        setSaving(false);
        return;
      }
      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("Lỗi kết nối máy chủ.");
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      {/* Thanh hành động dính trên cùng */}
      <div className="sticky top-0 z-20 -mx-6 md:-mx-8 px-6 md:px-8 py-3 bg-gray-100/95 backdrop-blur border-b border-gray-200 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Đăng bài"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className={labelCls}>Tiêu đề *</label>
          <input
            className={input}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Slug (để trống sẽ tự tạo)</label>
          <input
            className={input}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Tóm tắt</label>
          <textarea
            className={input}
            rows={2}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="Để trống sẽ tự lấy từ nội dung."
          />
        </div>
        <ImageUpload
          label="Ảnh bìa"
          value={form.coverImage}
          onChange={(url) => set("coverImage", url)}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <RichTextEditor
          label="Nội dung *"
          value={form.content}
          onChange={(html) => set("content", html)}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set("published", e.target.checked)}
          />
          Xuất bản (hiển thị công khai)
        </label>
      </div>
    </form>
  );
}
