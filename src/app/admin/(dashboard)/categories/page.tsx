"use client";

import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Thêm thất bại.");
      return;
    }
    setName("");
    load();
  }

  async function saveEdit(id: number) {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      setEditingId(null);
      load();
    }
  }

  async function remove(id: number, name: string) {
    if (!confirm(`Xóa danh mục "${name}"? Sản phẩm thuộc danh mục sẽ không bị xóa.`))
      return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Danh mục sản phẩm</h1>

      <form onSubmit={add} className="flex gap-2 mb-6 max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên danh mục mới..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        />
        <button className="bg-brand-600 text-white px-5 rounded-lg font-medium hover:bg-brand-700">
          Thêm
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4 -mt-3">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-2xl">
        {loading ? (
          <p className="p-5 text-gray-500 text-sm">Đang tải...</p>
        ) : categories.length === 0 ? (
          <p className="p-5 text-gray-500 text-sm">Chưa có danh mục nào.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-3">
                {editingId === c.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
                    />
                    <button
                      onClick={() => saveEdit(c.id)}
                      className="text-brand-700 text-sm font-medium"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-500 text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="font-medium text-gray-800">{c.name}</span>
                      <span className="text-xs text-gray-400 ml-2">/{c.slug}</span>
                      {c._count && (
                        <span className="text-xs text-gray-400 ml-2">
                          ({c._count.products} sản phẩm)
                        </span>
                      )}
                    </div>
                    <div className="space-x-3 text-sm">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditName(c.name);
                        }}
                        className="text-brand-700 hover:underline"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => remove(c.id, c.name)}
                        className="text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
