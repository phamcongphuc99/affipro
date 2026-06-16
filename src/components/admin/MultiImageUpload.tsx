"use client";

import { useState } from "react";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}

// Quản lý danh sách ảnh phụ (thư viện ảnh). Cho phép tải lên hoặc dán URL,
// xóa từng ảnh, giới hạn số lượng tối đa.
export default function MultiImageUpload({
  value,
  onChange,
  max = 5,
  label = "Thư viện ảnh",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const canAddMore = value.length < max;
  const remaining = max - value.length;

  function add(url: string) {
    if (!url) return;
    if (value.length >= max) {
      setError(`Tối đa ${max} ảnh.`);
      return;
    }
    onChange([...value, url]);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
    setError("");
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError("");

    // Chỉ nhận đủ số còn lại
    const slots = max - value.length;
    if (slots <= 0) {
      setError(`Tối đa ${max} ảnh.`);
      return;
    }
    const toUpload = files.slice(0, slots);
    if (files.length > slots) {
      setError(`Chỉ thêm được ${slots} ảnh nữa (tối đa ${max}).`);
    }

    setUploading(true);
    const uploaded: string[] = [];
    for (const file of toUpload) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok) uploaded.push(data.url);
        else setError(data.error || "Tải ảnh thất bại.");
      } catch {
        setError("Lỗi kết nối khi tải ảnh.");
      }
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
    setUploading(false);
    e.target.value = ""; // reset để chọn lại cùng file được
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{" "}
        <span className="text-gray-400 font-normal">
          ({value.length}/{max})
        </span>
      </label>

      {/* Lưới ảnh hiện có */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative group aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Ảnh ${i + 1}`} className="h-full w-full object-cover" />

              {/* Nút xóa */}
              <button
                type="button"
                onClick={() => remove(i)}
                title="Xóa ảnh"
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>

              {/* Nút đổi thứ tự */}
              <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  title="Sang trái"
                  className="h-6 w-6 rounded bg-black/60 text-white text-xs disabled:opacity-30"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  title="Sang phải"
                  className="h-6 w-6 rounded bg-black/60 text-white text-xs disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {canAddMore ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium text-gray-700">
              {uploading ? "Đang tải..." : `+ Tải ảnh lên (còn ${remaining})`}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFiles}
                disabled={uploading}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Hoặc dán URL ảnh rồi bấm Thêm"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
            <button
              type="button"
              onClick={() => {
                add(urlInput.trim());
                setUrlInput("");
              }}
              className="px-4 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-900"
            >
              Thêm
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Đã đạt tối đa {max} ảnh.</p>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
