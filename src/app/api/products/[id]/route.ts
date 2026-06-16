import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api";
import { toSlug } from "@/lib/utils";

// GET /api/products/[id]  (công khai)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
  return NextResponse.json(product);
}

// PUT /api/products/[id]  (cần đăng nhập)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const id = Number(params.id);
  const body = await req.json();

  const slug =
    body.slug && body.slug.trim() ? body.slug.trim() : toSlug(body.name || "");

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug,
        description: body.description ?? null,
        content: body.content ?? null,
        price: Number(body.price) || 0,
        salePrice: body.salePrice ? Number(body.salePrice) : null,
        imageUrl: body.imageUrl ?? null,
        gallery: body.gallery ?? null,
        affiliateUrl: body.affiliateUrl,
        store: body.store ?? null,
        rating: body.rating != null ? Number(body.rating) : 0,
        featured: Boolean(body.featured),
        published: Boolean(body.published),
        categoryId: body.categoryId ? Number(body.categoryId) : null,
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Cập nhật thất bại (slug có thể bị trùng)." },
      { status: 400 }
    );
  }
}

// DELETE /api/products/[id]  (cần đăng nhập)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const id = Number(params.id);
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
