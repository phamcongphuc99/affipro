"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import RichTextEditor from "./RichTextEditor";

// Danh sách các trường cấu hình, nhóm theo mục.
const FIELDS: {
  group: string;
  items: { key: string; label: string; type?: "text" | "textarea" | "html" | "image" }[];
}[] = [
  {
    group: "Thông tin chung",
    items: [
      { key: "site_name", label: "Tên website" },
      { key: "site_tagline", label: "Khẩu hiệu (tagline)" },
      { key: "site_description", label: "Mô tả website", type: "textarea" },
      { key: "logo_url", label: "Logo", type: "image" },
    ],
  },
  {
    group: "Banner trang chủ (Hero)",
    items: [
      { key: "hero_title", label: "Tiêu đề lớn" },
      { key: "hero_image", label: "Ảnh banner", type: "image" },
      { key: "hero_subtitle", label: "Mô tả phụ", type: "textarea" },
    ],
  },
  {
    group: "Trang giới thiệu",
    items: [{ key: "about_content", label: "Nội dung (HTML)", type: "html" }],
  },
  {
    group: "Thông tin liên hệ & chân trang",
    items: [
      { key: "contact_email", label: "Email" },
      { key: "contact_phone", label: "Điện thoại" },
      { key: "contact_address", label: "Địa chỉ" },
      { key: "facebook_url", label: "Facebook URL" },
      { key: "footer_text", label: "Dòng chữ chân trang" },
    ],
  },
];

export default function SettingsForm({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Lưu thất bại.");
      } else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {FIELDS.map((section) => (
        <div
          key={section.group}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <h2 className="font-semibold text-gray-900 mb-4">{section.group}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {section.items.map((field) => {
              // Các trường rộng (mô tả dài, soạn thảo) chiếm trọn 1 hàng;
              // ô ảnh để dạng cột để có thể ghép cặp cùng hàng với ô khác.
              const wide = field.type === "textarea" || field.type === "html";
              return (
              <div key={field.key} className={wide ? "md:col-span-2" : ""}>
                {field.type === "image" ? (
                  <ImageUpload
                    label={field.label}
                    value={form[field.key] || ""}
                    onChange={(url) => set(field.key, url)}
                  />
                ) : field.type === "html" ? (
                  <RichTextEditor
                    label={field.label}
                    value={form[field.key] || ""}
                    onChange={(html) => set(field.key, html)}
                  />
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        className={input}
                        rows={2}
                        value={form[field.key] || ""}
                        onChange={(e) => set(field.key, e.target.value)}
                      />
                    ) : (
                      <input
                        className={input}
                        value={form[field.key] || ""}
                        onChange={(e) => set(field.key, e.target.value)}
                      />
                    )}
                  </>
                )}
              </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
        {saved && <span className="text-emerald-600 text-sm">✔ Đã lưu</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </form>
  );
}
