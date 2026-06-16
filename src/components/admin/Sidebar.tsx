"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Tổng quan", exact: true },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/posts", label: "Tin tức" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/settings", label: "Cấu hình site" },
];

export default function Sidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 bg-gray-900 text-gray-300 flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-gray-800">
        <Link href="/admin" className="text-xl font-bold text-white">
          CMS Quản trị
        </Link>
        <p className="text-xs text-gray-500 mt-1">Xin chào, {name}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              isActive(l.href, l.exact)
                ? "bg-brand-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          ↗ Xem website
        </Link>
        <button
          onClick={logout}
          disabled={loading}
          className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>
    </aside>
  );
}
