"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Category {
  id: number;
  name: string;
}

interface Series {
  id: number;
  name: string;
  total: number;
  data: number[];
}

interface ApiResult {
  mode: "categories" | "products";
  from: string;
  to: string;
  days: string[];
  series: Series[];
  grandTotal: number;
}

// Bảng màu cho các đường
const COLORS = [
  "#1d6af1",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#ec4899",
  "#14b8a6",
];

// Lấy ngày YYYY-MM-DD (local)
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ClicksChart({ categories }: { categories: Category[] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Khởi tạo khoảng ngày mặc định (14 ngày gần nhất) ở phía client để tránh lệch SSR.
  useEffect(() => {
    const today = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 13);
    setFrom(ymd(start));
    setTo(ymd(today));
  }, []);

  // Gọi API mỗi khi đổi điều kiện lọc
  useEffect(() => {
    if (!from || !to) return;
    let aborted = false;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ from, to });
    if (categoryId) params.set("categoryId", categoryId);

    fetch(`/api/analytics/clicks?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (aborted) return;
        if (data.error) setError(data.error);
        else setResult(data);
      })
      .catch(() => !aborted && setError("Không tải được dữ liệu."))
      .finally(() => !aborted && setLoading(false));

    return () => {
      aborted = true;
    };
  }, [from, to, categoryId]);

  // Chuyển dữ liệu sang định dạng cho Recharts: mỗi phần tử là 1 ngày.
  const chartData = useMemo(() => {
    if (!result) return [];
    return result.days.map((day, i) => {
      const row: Record<string, string | number> = {
        // nhãn ngắn dd/MM
        date: day.slice(8, 10) + "/" + day.slice(5, 7),
      };
      result.series.forEach((s) => {
        row[s.name] = s.data[i];
      });
      return row;
    });
  }, [result]);

  // Nút chọn nhanh khoảng ngày
  function quickRange(days: number) {
    const today = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    setFrom(ymd(start));
    setTo(ymd(today));
  }

  const inputCls =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="font-semibold text-gray-900">
            Biểu đồ lượt bấm mua theo ngày
          </h2>
          <p className="text-sm text-gray-500">
            {categoryId
              ? "So sánh các sản phẩm trong danh mục đã chọn"
              : "So sánh giữa các danh mục"}
          </p>
        </div>
        {result && (
          <div className="text-sm text-gray-500">
            Tổng lượt bấm:{" "}
            <span className="font-semibold text-brand-700">
              {result.grandTotal}
            </span>
          </div>
        )}
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Danh mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputCls}
          >
            <option value="">Tất cả (so sánh danh mục)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => quickRange(d)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              {d} ngày
            </button>
          ))}
        </div>
      </div>

      {/* Biểu đồ */}
      {error ? (
        <p className="text-red-500 text-sm py-10 text-center">{error}</p>
      ) : loading ? (
        <p className="text-gray-400 text-sm py-20 text-center">Đang tải...</p>
      ) : result && result.series.length > 0 ? (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              {result.series.map((s, idx) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.name}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-400 text-sm py-20 text-center">
          Chưa có lượt bấm nào trong khoảng thời gian này.
        </p>
      )}

      {/* Bảng tổng theo nhóm */}
      {result && result.series.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3">
          {result.series.map((s, idx) => (
            <div
              key={s.id}
              className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-1.5"
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-gray-700">{s.name}</span>
              <span className="font-semibold text-gray-900">{s.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
