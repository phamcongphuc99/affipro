import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

// Tự sinh sitemap.xml từ các trang tĩnh + sản phẩm + bài viết đang hiển thị.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/san-pham`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/tin-tuc`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/gioi-thieu`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/lien-he`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [products, posts] = await Promise.all([
      prisma.product.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.post.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/san-pham/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${SITE_URL}/tin-tuc/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticPages, ...productUrls, ...postUrls];
  } catch {
    return staticPages;
  }
}
