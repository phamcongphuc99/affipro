import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, badRequest } from "@/lib/api";
import { toSlug } from "@/lib/utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { name } = await req.json();
  if (!name || !name.trim()) return badRequest("Tên danh mục bắt buộc");

  const category = await prisma.category.update({
    where: { id: Number(params.id) },
    data: { name: name.trim(), slug: toSlug(name) },
  });
  return NextResponse.json(category);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  // Sản phẩm thuộc danh mục sẽ được đặt categoryId = null (theo schema onDelete: SetNull)
  await prisma.category.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
