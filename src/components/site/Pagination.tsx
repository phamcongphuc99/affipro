import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string; // vd: "/san-pham"
  // Các tham số truy vấn hiện tại cần giữ lại (category, search...) - KHÔNG gồm page
  params?: Record<string, string | undefined>;
}

// Tạo dãy số trang hiển thị (có dấu "..." khi nhiều trang)
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

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  params = {},
}: Props) {
  if (totalPages <= 1) return null;

  const hrefFor = (page: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
    }
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = getPages(currentPage, totalPages);
  const baseBtn =
    "inline-flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium border";

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5">
      {/* Trang trước */}
      {currentPage > 1 ? (
        <Link
          href={hrefFor(currentPage - 1)}
          className={`${baseBtn} border-gray-200 bg-white text-gray-600 hover:border-brand-400`}
        >
          ‹ Trước
        </Link>
      ) : (
        <span className={`${baseBtn} border-gray-100 bg-gray-50 text-gray-300`}>
          ‹ Trước
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="px-2 text-gray-400">
            …
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            className={`${baseBtn} border-brand-600 bg-brand-600 text-white`}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            className={`${baseBtn} border-gray-200 bg-white text-gray-700 hover:border-brand-400`}
          >
            {p}
          </Link>
        )
      )}

      {/* Trang sau */}
      {currentPage < totalPages ? (
        <Link
          href={hrefFor(currentPage + 1)}
          className={`${baseBtn} border-gray-200 bg-white text-gray-600 hover:border-brand-400`}
        >
          Sau ›
        </Link>
      ) : (
        <span className={`${baseBtn} border-gray-100 bg-gray-50 text-gray-300`}>
          Sau ›
        </span>
      )}
    </nav>
  );
}
