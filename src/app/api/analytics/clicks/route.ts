import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

// Định dạng ngày local thành YYYY-MM-DD
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// GET /api/analytics/clicks?from=YYYY-MM-DD&to=YYYY-MM-DD&categoryId=
// - Không có categoryId  -> so sánh theo DANH MỤC (mỗi danh mục 1 đường).
// - Có categoryId        -> so sánh các SẢN PHẨM trong danh mục đó.
export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const categoryIdRaw = searchParams.get("categoryId");
  const categoryId =
    categoryIdRaw && categoryIdRaw !== "" ? Number(categoryIdRaw) : null;

  // Khoảng ngày mặc định: 14 ngày gần nhất
  const today = new Date();
  const toParam = searchParams.get("to");
  const fromParam = searchParams.get("from");

  const to = endOfDay(toParam ? new Date(toParam) : today);
  const defaultFrom = new Date(to);
  defaultFrom.setDate(defaultFrom.getDate() - 13);
  const from = startOfDay(fromParam ? new Date(fromParam) : defaultFrom);

  if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
    return NextResponse.json({ error: "Khoảng ngày không hợp lệ." }, { status: 400 });
  }

  // Danh sách các ngày trong khoảng
  const days: string[] = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    days.push(ymd(d));
  }

  const events = await prisma.clickEvent.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      ...(categoryId != null ? { categoryId } : {}),
    },
    select: { createdAt: true, productId: true, categoryId: true },
  });

  const mode: "categories" | "products" =
    categoryId != null ? "products" : "categories";

  // Gom nhóm: groupId -> (ngày -> số lượt)
  const grouped = new Map<number, Map<string, number>>();
  for (const ev of events) {
    const gid = mode === "products" ? ev.productId : ev.categoryId ?? 0; // 0 = chưa phân loại
    const day = ymd(ev.createdAt);
    if (!grouped.has(gid)) grouped.set(gid, new Map());
    const m = grouped.get(gid)!;
    m.set(day, (m.get(day) || 0) + 1);
  }

  // Lấy tên cho từng nhóm
  const ids = Array.from(grouped.keys());
  const names = new Map<number, string>();
  if (mode === "products") {
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
    products.forEach((p) => names.set(p.id, p.name));
  } else {
    const cats = await prisma.category.findMany({
      where: { id: { in: ids.filter((i) => i !== 0) } },
      select: { id: true, name: true },
    });
    cats.forEach((c) => names.set(c.id, c.name));
    if (grouped.has(0)) names.set(0, "Chưa phân loại");
  }

  // Tạo series theo đúng thứ tự ngày, sắp xếp theo tổng giảm dần, lấy tối đa 8 nhóm
  let series = ids.map((gid) => {
    const m = grouped.get(gid)!;
    const data = days.map((d) => m.get(d) || 0);
    const total = data.reduce((a, b) => a + b, 0);
    return { id: gid, name: names.get(gid) || `#${gid}`, total, data };
  });
  series.sort((a, b) => b.total - a.total);
  series = series.slice(0, 8);

  const grandTotal = series.reduce((a, s) => a + s.total, 0);

  return NextResponse.json({
    mode,
    from: ymd(from),
    to: ymd(to),
    days,
    series,
    grandTotal,
  });
}
