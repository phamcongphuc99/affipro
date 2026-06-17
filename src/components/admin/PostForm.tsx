"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import RichTextEditor from "./RichTextEditor";
import SeoChecklist from "./SeoChecklist";
import { toSlug } from "@/lib/utils";

interface PostData {
  id?: number;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  ogImage?: string | null;
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
    metaTitle: post?.metaTitle || "",
    metaDescription: post?.metaDescription || "",
    focusKeyword: post?.focusKeyword || "",
    ogImage: post?.ogImage || "",
    published: post?.published ?? true,
  });
  // Khi sửa bài cũ thì coi như slug đã được chỉnh tay (không tự ghi đè).
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Nhập tiêu đề: tự sinh slug nếu người dùng chưa tự sửa slug.
  function handleTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugEdited ? f.slug : toSlug(value),
    }));
  }

  // Người dùng tự sửa slug -> đánh dấu để không auto ghi đè nữa.
  function handleSlugChange(value: string) {
    setSlugEdited(true);
    set("slug", value);
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
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
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
        {/* Hàng 1: Tiêu đề | Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Tiêu đề *</label>
            <input
              className={input}
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Slug (URL) — tự tạo từ tiêu đề</label>
            <input
              className={input}
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="vd: mat-ong-rung"
            />
          </div>
        </div>

        {/* Hàng 2: Tóm tắt | Ảnh bìa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            <label className={labelCls}>Tóm tắt</label>
            <textarea
              className={input}
              rows={4}
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

      {/* ===== Tối ưu SEO ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Tối ưu SEO</h2>
          <p className="text-sm text-gray-500">
            Đặt từ khóa chính rồi tối ưu tiêu đề, mô tả, URL theo gợi ý bên phải.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* Cột nhập liệu */}
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Từ khóa chính (focus keyword)</label>
              <input
                className={input}
                value={form.focusKeyword}
                onChange={(e) => set("focusKeyword", e.target.value)}
                placeholder="vd: mật ong rừng"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className={labelCls}>Meta title (thẻ tiêu đề)</label>
                <span
                  className={`text-xs ${
                    form.metaTitle.length > 60
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {form.metaTitle.length}/60
                </span>
              </div>
              <input
                className={input}
                value={form.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder={form.title || "Tiêu đề hiển thị trên Google"}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className={labelCls}>Meta description (mô tả)</label>
                <span
                  className={`text-xs ${
                    form.metaDescription.length > 160
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {form.metaDescription.length}/160
                </span>
              </div>
              <textarea
                className={input}
                rows={3}
                value={form.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                placeholder={
                  form.excerpt || "Mô tả ngắn gọn, hấp dẫn (150-160 ký tự)"
                }
              />
            </div>

            <ImageUpload
              label="Ảnh chia sẻ MXH (Open Graph) — để trống dùng ảnh bìa"
              value={form.ogImage}
              onChange={(url) => set("ogImage", url)}
            />

            {/* Xem trước kết quả tìm kiếm Google */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                Xem trước trên Google:
              </p>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 truncate">
                  {process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.vn"}
                  /tin-tuc/{form.slug || "duong-dan-bai-viet"}
                </div>
                <div className="text-[#1a0dab] text-lg leading-snug truncate">
                  {form.metaTitle || form.title || "Tiêu đề bài viết"}
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {form.metaDescription ||
                    form.excerpt ||
                    "Mô tả bài viết sẽ hiển thị ở đây..."}
                </div>
              </div>
            </div>
          </div>

          {/* Cột checklist SEO real-time */}
          <SeoChecklist
            focusKeyword={form.focusKeyword}
            title={form.title}
            metaTitle={form.metaTitle}
            metaDescription={form.metaDescription}
            slug={form.slug}
            content={form.content}
          />
        </div>
      </div>
    </form>
  );
}
