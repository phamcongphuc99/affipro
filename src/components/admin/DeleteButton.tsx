"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Nút xóa dùng chung: gọi API DELETE rồi refresh trang.
export default function DeleteButton({
  url,
  label = "Xóa",
  confirmText = "Bạn có chắc muốn xóa mục này?",
  className = "text-red-600 hover:text-red-700 hover:underline text-sm",
}: {
  url: string;
  label?: string;
  confirmText?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmText)) return;
    setLoading(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Xóa thất bại.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      alert("Lỗi kết nối máy chủ.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`${className} disabled:opacity-50`}
    >
      {loading ? "Đang xóa..." : label}
    </button>
  );
}
