"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import DeleteButton from "./DeleteButton";
import SafeImage from "@/components/site/SafeImage";

interface Post {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  views: number;
  published: boolean;
  publishedAt: string | Date | null;
  createdAt: string | Date;
}

// Bỏ dấu tiếng Việt để tìm "không dấu" cũng khớp.
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

const PAGE_SIZE = 10;

function getPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export default function PostsTable({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return posts;
    return posts.filter((p) => normalize(p.title).includes(q));
  }, [posts, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE
  );

  return (
    <div>
      {/* Tìm kiếm */}
      <div className="mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Gõ để tìm bài viết theo tiêu đề..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Xóa"
            >
              ✕
            </button>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {filtered.length}/{posts.length} bài viết
        </span>
      </div>

      {/* Bảng */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Bài viết</th>
              <th className="px-4 py-3 font-medium">Ngày</th>
              <th className="px-4 py-3 font-medium">Lượt xem</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageItems.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={p.coverImage}
                      alt={p.title}
                      className="h-10 w-16 rounded object-cover bg-gray-100"
                    />
                    <span className="font-medium text-gray-800 line-clamp-2">
                      {p.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(p.publishedAt || p.createdAt)}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.views}</td>
                <td className="px-4 py-3">
                  {p.published ? (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                      Đã xuất bản
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      Nháp
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/posts/${p.id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 transition"
                    >
                      ✎ Sửa
                    </Link>
                    <DeleteButton
                      url={`/api/posts/${p.id}`}
                      label="🗑 Xóa"
                      confirmText={`Xóa bài "${p.title}"?`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  Không tìm thấy bài viết nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-gray-500">
            Trang {current}/{totalPages} — hiển thị{" "}
            {(current - 1) * PAGE_SIZE + 1}–
            {(current - 1) * PAGE_SIZE + pageItems.length} / {filtered.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current <= 1}
              className="min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-brand-400 disabled:opacity-40 disabled:hover:border-gray-200"
            >
              ‹ Trước
            </button>
            {getPages(current, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`d-${i}`} className="px-2 text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium border ${
                    p === current
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-brand-400"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current >= totalPages}
              className="min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-brand-400 disabled:opacity-40 disabled:hover:border-gray-200"
            >
              Sau ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
