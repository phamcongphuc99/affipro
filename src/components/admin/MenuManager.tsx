"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_NAV, type NavItem } from "@/lib/nav";

export default function MenuManager({ initial }: { initial: NavItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<NavItem[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(index: number, patch: Partial<NavItem>) {
    setItems((arr) => arr.map((it, i) => (i === index ? { ...it, ...patch } : it)));
    setSaved(false);
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    setItems((arr) => {
      const next = [...arr];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSaved(false);
  }

  function remove(index: number) {
    if (!confirm("Xóa mục menu này?")) return;
    setItems((arr) => arr.filter((_, i) => i !== index));
    setSaved(false);
  }

  function add() {
    setItems((arr) => [...arr, { label: "Mục mới", href: "/", visible: true }]);
    setSaved(false);
  }

  function resetDefault() {
    if (!confirm("Khôi phục menu mặc định?")) return;
    setItems(DEFAULT_NAV);
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    // Loại mục thiếu label/href
    const clean = items
      .map((i) => ({
        label: i.label.trim(),
        href: i.href.trim(),
        visible: i.visible,
      }))
      .filter((i) => i.label && i.href);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nav_menu: JSON.stringify(clean) }),
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
    "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none";

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Thanh hành động dính trên cùng */}
      <div className="sticky top-0 z-20 -mx-6 md:-mx-8 px-6 md:px-8 py-3 bg-gray-100/95 backdrop-blur border-b border-gray-200 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu menu"}
        </button>
        <button
          onClick={resetDefault}
          className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm"
        >
          Khôi phục mặc định
        </button>
        {saved && <span className="text-emerald-600 text-sm">✔ Đã lưu</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-500 mb-4">
          Đổi tên, ẩn/hiện, sắp xếp hoặc thêm mục cho menu trên đầu trang. Đường
          dẫn có thể là nội bộ (<code>/san-pham</code>) hoặc link ngoài
          (<code>https://...</code>).
        </p>

        <div className="space-y-3">
          {/* Tiêu đề cột */}
          <div className="hidden md:flex gap-3 text-xs font-medium text-gray-400 px-1">
            <span className="w-16">Thứ tự</span>
            <span className="flex-1">Tên hiển thị</span>
            <span className="flex-1">Đường dẫn</span>
            <span className="w-20 text-center">Hiển thị</span>
            <span className="w-12 text-right">Xóa</span>
          </div>

          {items.map((item, i) => (
            <div
              key={i}
              className={`flex flex-col md:flex-row md:items-center gap-3 rounded-lg border p-3 ${
                item.visible ? "border-gray-200" : "border-gray-200 bg-gray-50 opacity-70"
              }`}
            >
              {/* Sắp xếp */}
              <div className="flex md:w-16 gap-1">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="h-8 w-8 rounded border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50"
                  title="Lên"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  className="h-8 w-8 rounded border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50"
                  title="Xuống"
                >
                  ↓
                </button>
              </div>

              <input
                className={`${input} flex-1`}
                value={item.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="Tên hiển thị"
              />
              <input
                className={`${input} flex-1`}
                value={item.href}
                onChange={(e) => update(i, { href: e.target.value })}
                placeholder="/duong-dan"
              />

              <label className="md:w-20 flex items-center justify-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={item.visible}
                  onChange={(e) => update(i, { visible: e.target.checked })}
                />
                <span className="md:hidden">Hiển thị</span>
              </label>

              <div className="md:w-12 md:text-right">
                <button
                  onClick={() => remove(i)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={add}
          className="mt-4 text-sm font-medium text-brand-700 hover:underline"
        >
          + Thêm mục menu
        </button>
      </div>
    </div>
  );
}
