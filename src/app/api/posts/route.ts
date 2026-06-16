import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, badRequest } from "@/lib/api";
import { toSlug, stripHtml, truncate } from "@/lib/utils";

const postSchema = z.object({
  title: z.string().min(1, "Tiêu đề bắt buộc"),
  slug: z.string().optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1, "Nội dung bắt buộc"),
  coverImage: z.string().optional().nullable(),
  published: z.coerce.boolean().default(true),
});

// GET /api/posts?search=&all=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const all = searchParams.get("all");

  const where: any = {};
  if (!all) where.published = true;
  if (search) where.title = { contains: search };

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

// POST /api/posts
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ");
  }

  const data = parsed.data;
  const slug = (data.slug && data.slug.trim()) || toSlug(data.title);
  const existing = await prisma.post.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-5)}` : slug;

  const excerpt =
    data.excerpt && data.excerpt.trim()
      ? data.excerpt
      : truncate(stripHtml(data.content), 160);

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: finalSlug,
      excerpt,
      content: data.content,
      coverImage: data.coverImage || null,
      published: data.published,
      publishedAt: data.published ? new Date() : null,
    },
  });
  return NextResponse.json(post, { status: 201 });
}
