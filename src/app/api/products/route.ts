import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, badRequest } from "@/lib/api";
import { toSlug } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm bắt buộc"),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  price: z.coerce.number().int().min(0).default(0),
  salePrice: z.coerce.number().int().min(0).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  gallery: z.string().optional().nullable(),
  affiliateUrl: z.string().min(1, "Link affiliate bắt buộc"),
  store: z.string().optional().nullable(),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(true),
  categoryId: z.coerce.number().int().optional().nullable(),
});

// GET /api/products?search=&category=&featured=  (công khai)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const featured = searchParams.get("featured");
  const all = searchParams.get("all"); // admin lấy cả chưa publish

  const where: any = {};
  if (!all) where.published = true;
  if (featured === "true") where.featured = true;
  if (search) where.name = { contains: search };
  if (category) where.category = { slug: category };

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

// POST /api/products  (cần đăng nhập)
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ");
  }

  const data = parsed.data;
  const slug = (data.slug && data.slug.trim()) || toSlug(data.name);

  // Đảm bảo slug không trùng
  const existing = await prisma.product.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-5)}` : slug;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: finalSlug,
      description: data.description || null,
      content: data.content || null,
      price: data.price,
      salePrice: data.salePrice || null,
      imageUrl: data.imageUrl || null,
      gallery: data.gallery || null,
      affiliateUrl: data.affiliateUrl,
      store: data.store || null,
      rating: data.rating ?? 0,
      featured: data.featured,
      published: data.published,
      categoryId: data.categoryId || null,
    },
  });
  return NextResponse.json(product, { status: 201 });
}
