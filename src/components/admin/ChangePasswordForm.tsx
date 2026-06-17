"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk(false);
    if (newPassword !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đổi mật khẩu thất bại.");
      } else {
        setOk(true);
        setCurrent("");
        setNew("");
        setConfirm("");
      }
    } catch {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-md"
    >
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">
          {error}
        </div>
      )}
      {ok && (
        <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-2.5 rounded-lg">
          ✔ Đã đổi mật khẩu thành công.
        </div>
      )}
      <div>
        <label className={labelCls}>Mật khẩu hiện tại</label>
        <input
          type="password"
          className={input}
          value={currentPassword}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </div>
      <div>
        <label className={labelCls}>Mật khẩu mới</label>
        <input
          type="password"
          className={input}
          value={newPassword}
          onChange={(e) => setNew(e.target.value)}
          required
          placeholder="Tối thiểu 6 ký tự"
        />
      </div>
      <div>
        <label className={labelCls}>Xác nhận mật khẩu mới</label>
        <input
          type="password"
          className={input}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50"
      >
        {saving ? "Đang lưu..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
