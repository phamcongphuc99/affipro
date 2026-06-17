import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, stripHtml, truncate } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { jsonLdString } from "@/lib/jsonld";
import { sanitizeHtml } from "@/lib/sanitize";
import SafeImage from "@/components/site/SafeImage";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post) return { title: "Không tìm thấy bài viết" };

  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription ||
    post.excerpt ||
    truncate(stripHtml(post.content), 160);
  const url = `${SITE_URL}/tin-tuc/${post.slug}`;
  const shareImage = post.ogImage || post.coverImage || undefined;
  const images = shareImage ? [{ url: shareImage }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images,
      publishedTime: (post.publishedAt || post.createdAt).toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: shareImage ? [shareImage] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const [post, settings] = await Promise.all([
    prisma.post.findUnique({ where: { slug: params.slug } }),
    getSettings(),
  ]);

  if (!post || !post.published) notFound();

  // Tăng lượt xem (không chặn render)
  prisma.post
    .update({ where: { id: post.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  // Lấy nhiều bài cho sidebar: 5 "liên quan" + 5 "xem thêm"
  const sidebarPosts = await prisma.post.findMany({
    where: { published: true, id: { not: post.id } },
    take: 10,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, coverImage: true, createdAt: true },
  });
  const relatedPosts = sidebarPosts.slice(0, 5);
  const morePosts = sidebarPosts.slice(5, 10);

  const url = `${SITE_URL}/tin-tuc/${post.slug}`;
  const siteName = settings.site_name || "AffiPro";

  // JSON-LD: bài viết (Article) + đường dẫn điều hướng (Breadcrumb)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.metaTitle || post.title,
        description:
          post.metaDescription ||
          post.excerpt ||
          truncate(stripHtml(post.content), 160),
        ...(post.ogImage || post.coverImage
          ? { image: [post.ogImage || post.coverImage] }
          : {}),
        datePublished: (post.publishedAt || post.createdAt).toISOString(),
        dateModified: post.updatedAt.toISOString(),
        author: { "@type": "Organization", name: siteName },
        publisher: {
          "@type": "Organization",
          name: siteName,
          ...(settings.logo_url ? { logo: { "@type": "ImageObject", url: settings.logo_url } } : {}),
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Tin tức", item: `${SITE_URL}/tin-tuc` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <div className="container py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-700">Trang chủ</Link>
        <span className="mx-2">›</span>
        <Link href="/tin-tuc" className="hover:text-brand-700">Tin tức</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700 line-clamp-1 inline">{post.title}</span>
      </nav>

      {/* Bố cục 2 cột: nội dung + sidebar */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* ===== Nội dung bài viết ===== */}
        <article className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
            {post.title}
          </h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-gray-400">
            <time>{formatDate(post.publishedAt || post.createdAt)}</time>
            <span>•</span>
            <span>{post.views} lượt xem</span>
          </div>

          {post.excerpt && (
            <p className="mt-5 text-lg italic text-gray-600 border-l-4 border-brand-200 pl-4">
              {post.excerpt}
            </p>
          )}

          {post.coverImage && (
            <SafeImage
              src={post.coverImage}
              alt={post.title}
              className="mt-6 w-full rounded-xl object-cover max-h-[440px]"
            />
          )}

          <div
            className="prose-content mt-8"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
        </article>

        {/* ===== Sidebar ===== */}
        <aside className="space-y-6 lg:sticky lg:top-20">
          {/* Banner quảng cáo (cấu hình ảnh + link trong CMS) */}
          {(() => {
            const bannerImg = settings.sidebar_banner_image || settings.hero_image;
            const bannerLink = settings.sidebar_banner_link || "/san-pham";
            if (!bannerImg) return null;
            const isExternal = /^https?:\/\//i.test(bannerLink);
            const img = (
              <SafeImage
                src={bannerImg}
                alt="Banner"
                className="w-full h-40 object-cover"
              />
            );
            const cls =
              "block rounded-xl overflow-hidden border border-gray-200";
            return isExternal ? (
              <a
                href={bannerLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
              >
                {img}
              </a>
            ) : (
              <Link href={bannerLink} className={cls}>
                {img}
              </Link>
            );
          })()}

          {/* Bài viết liên quan */}
          {relatedPosts.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="flex items-center gap-2 font-bold text-brand-700 pb-3 mb-3 border-b border-gray-100">
                📋 Bài viết liên quan
              </h2>
              <ul className="space-y-4">
                {relatedPosts.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/tin-tuc/${p.slug}`}
                      className="flex gap-3 group"
                    >
                      <SafeImage
                        src={p.coverImage}
                        alt={p.title}
                        className="h-14 w-20 shrink-0 rounded-md object-cover bg-gray-100"
                      />
                      <span className="text-sm text-gray-700 leading-snug line-clamp-2 group-hover:text-brand-700">
                        {p.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Xem thêm */}
          {morePosts.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="flex items-center gap-2 font-bold text-brand-700 pb-3 mb-3 border-b border-gray-100">
                📰 Xem thêm
              </h2>
              <ul className="divide-y divide-gray-100">
                {morePosts.map((p) => (
                  <li key={p.id} className="py-2.5 first:pt-0 last:pb-0">
                    <Link
                      href={`/tin-tuc/${p.slug}`}
                      className="text-sm text-gray-600 leading-snug line-clamp-2 hover:text-brand-700"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
