import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, badRequest } from "@/lib/api";
import { toSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/categories  (công khai)
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

// POST /api/categories
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { name } = await req.json();
  if (!name || !name.trim()) return badRequest("Tên danh mục bắt buộc");

  const slug = toSlug(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return badRequest("Danh mục đã tồn tại");

  const category = await prisma.category.create({ data: { name: name.trim(), slug } });
  return NextResponse.json(category, { status: 201 });
}
