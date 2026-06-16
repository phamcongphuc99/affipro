import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import PostCard from "@/components/site/PostCard";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post) return { title: "Không tìm thấy bài viết" };
  return { title: post.title, description: post.excerpt || undefined };
}

export default async function PostDetailPage({ params }: Props) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });

  if (!post || !post.published) notFound();

  // Tăng lượt xem (không chặn render)
  prisma.post
    .update({ where: { id: post.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const related = await prisma.post.findMany({
    where: { published: true, id: { not: post.id } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container py-10">
      <article className="max-w-3xl mx-auto">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-brand-700">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href="/tin-tuc" className="hover:text-brand-700">Tin tức</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {post.title}
        </h1>
        <time className="block mt-3 text-sm text-gray-400">
          {formatDate(post.publishedAt || post.createdAt)}
        </time>

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="mt-6 w-full rounded-2xl object-cover max-h-[420px]"
          />
        )}

        <div
          className="prose-content mt-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {related.length > 0 && (
        <div className="max-w-5xl mx-auto mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Bài viết khác</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
