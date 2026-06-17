"use client";

import { useEffect, useState } from "react";
import { ROLES, roleLabel } from "@/lib/permissions";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface FormState {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

const empty: FormState = { name: "", email: "", password: "", role: "EDITOR" };

export default function UsersManager({ currentUserId }: { currentUserId: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(empty);
    setError("");
    setOpen(true);
  }
  function openEdit(u: User) {
    setForm({ id: u.id, name: u.name, email: u.email, password: "", role: u.role });
    setError("");
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const isEdit = !!form.id;
    try {
      const res = await fetch(isEdit ? `/api/users/${form.id}` : "/api/users", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Lưu thất bại.");
      } else {
        setOpen(false);
        load();
      }
    } catch {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(u: User) {
    if (!confirm(`Xóa tài khoản "${u.name}" (${u.email})?`)) return;
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Xóa thất bại.");
      return;
    }
    load();
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="bg-brand-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-brand-700"
        >
          + Thêm tài khoản
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Nhóm quyền</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="ml-2 text-xs text-gray-400">(bạn)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        u.role === "ADMIN"
                          ? "bg-brand-50 text-brand-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100"
                      >
                        ✎ Sửa
                      </button>
                      {u.id !== currentUserId && (
                        <button
                          onClick={() => remove(u)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
                        >
                          🗑 Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal tạo/sửa */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={submit}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-gray-900">
              {form.id ? "Sửa tài khoản" : "Thêm tài khoản"}
            </h2>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className={labelCls}>Tên</label>
              <input
                className={input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                className={input}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelCls}>
                Mật khẩu {form.id && <span className="text-gray-400">(để trống nếu giữ nguyên)</span>}
              </label>
              <input
                type="password"
                className={input}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={form.id ? "••••••" : "Tối thiểu 6 ký tự"}
                {...(form.id ? {} : { required: true })}
              />
            </div>
            <div>
              <label className={labelCls}>Nhóm quyền</label>
              <select
                className={input}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {ROLES.find((r) => r.value === form.role)?.desc}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
