"use client";

import { useMemo } from "react";
import { analyzeSeo, seoScore, type SeoInput } from "@/lib/seo";

// Hiển thị checklist SEO real-time (xanh = đạt, đỏ = chưa đạt, xám = chưa đánh giá).
export default function SeoChecklist(props: SeoInput) {
  const checks = useMemo(() => analyzeSeo(props), [props]);
  const score = seoScore(checks);

  const scoreColor =
    score >= 80
      ? "text-emerald-600"
      : score >= 50
      ? "text-amber-600"
      : "text-red-600";
  const barColor =
    score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Đánh giá SEO</h3>
        <span className={`text-sm font-bold ${scoreColor}`}>{score}/100</span>
      </div>

      {/* Thanh điểm */}
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden mb-4">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>

      <ul className="space-y-2">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                c.status === "pass"
                  ? "bg-emerald-100 text-emerald-700"
                  : c.status === "fail"
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {c.status === "pass" ? "✓" : c.status === "fail" ? "✕" : "•"}
            </span>
            <div>
              <span
                className={
                  c.status === "pass"
                    ? "text-gray-700"
                    : c.status === "fail"
                    ? "text-gray-800"
                    : "text-gray-400"
                }
              >
                {c.label}
              </span>
              {c.hint && (
                <p className="text-xs text-gray-400 mt-0.5">{c.hint}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
