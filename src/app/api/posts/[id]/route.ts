import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api";
import { toSlug, stripHtml, truncate } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({ where: { id: Number(params.id) } });
  if (!post) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const id = Number(params.id);
  const body = await req.json();
  const slug =
    body.slug && body.slug.trim() ? body.slug.trim() : toSlug(body.title || "");
  const excerpt =
    body.excerpt && body.excerpt.trim()
      ? body.excerpt
      : truncate(stripHtml(body.content || ""), 160);

  try {
    const current = await prisma.post.findUnique({ where: { id } });
    const post = await prisma.post.update({
      where: { id },
      data: {
        title: body.title,
        slug,
        excerpt,
        content: body.content,
        coverImage: body.coverImage ?? null,
        metaTitle: body.metaTitle ?? null,
        metaDescription: body.metaDescription ?? null,
        focusKeyword: body.focusKeyword ?? null,
        ogImage: body.ogImage ?? null,
        published: Boolean(body.published),
        // Đặt publishedAt khi lần đầu publish
        publishedAt:
          body.published && !current?.publishedAt
            ? new Date()
            : current?.publishedAt ?? null,
      },
    });
    return NextResponse.json(post);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Cập nhật thất bại (slug có thể bị trùng)." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  await prisma.post.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
