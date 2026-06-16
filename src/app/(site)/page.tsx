import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import ProductCard from "@/components/site/ProductCard";
import PostCard from "@/components/site/PostCard";

// Render động ở mỗi request để luôn hiển thị nội dung mới nhất từ CMS.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();

  const [featured, latestProducts, posts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, featured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { published: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.findMany({
      where: { published: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  const showcase = featured.length > 0 ? featured : latestProducts;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="container py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              {settings.hero_title || "Mua sắm thông minh, tiết kiệm mỗi ngày"}
            </h1>
            <p className="mt-4 text-brand-100 text-lg">
              {settings.hero_subtitle ||
                "Tổng hợp sản phẩm chất lượng và ưu đãi tốt nhất từ các sàn thương mại điện tử."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/san-pham"
                className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition"
              >
                Khám phá sản phẩm
              </Link>
              <Link
                href="/tin-tuc"
                className="border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition"
              >
                Đọc tin tức
              </Link>
            </div>
          </div>
          {settings.hero_image && (
            <div className="hidden md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.hero_image}
                alt="Hero"
                className="rounded-2xl shadow-2xl object-cover w-full h-80"
              />
            </div>
          )}
        </div>
      </section>

      {/* Danh mục */}
      {categories.length > 0 && (
        <section className="container py-10">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/san-pham?category=${c.slug}`}
                className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-medium hover:border-brand-400 hover:text-brand-700 transition"
              >
                {c.name}{" "}
                <span className="text-gray-400">({c._count.products})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sản phẩm nổi bật */}
      <section className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {featured.length > 0 ? "Sản phẩm nổi bật" : "Sản phẩm mới"}
          </h2>
          <Link href="/san-pham" className="text-brand-700 font-medium hover:underline">
            Xem tất cả →
          </Link>
        </div>
        {showcase.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {showcase.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Chưa có sản phẩm nào.</p>
        )}
      </section>

      {/* Tin tức mới nhất */}
      {posts.length > 0 && (
        <section className="container py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tin tức mới nhất</h2>
            <Link href="/tin-tuc" className="text-brand-700 font-medium hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* CTA giới thiệu */}
      <section className="container py-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {settings.site_name || "AffiPro"} là gì?
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            {settings.site_description ||
              "Chúng tôi giúp bạn tìm được sản phẩm tốt với mức giá hợp lý nhất."}
          </p>
          <Link
            href="/gioi-thieu"
            className="mt-6 inline-block bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-700 transition"
          >
            Tìm hiểu thêm
          </Link>
        </div>
      </section>
    </>
  );
}
