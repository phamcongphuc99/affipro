import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, discountPercent } from "@/lib/utils";
import ProductCard from "@/components/site/ProductCard";
import ProductGallery from "@/components/site/ProductGallery";
import ComparisonTable from "@/components/site/ComparisonTable";
import { jsonLdString } from "@/lib/jsonld";
import { sanitizeHtml } from "@/lib/sanitize";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });
  if (!product) return { title: "Không tìm thấy sản phẩm" };
  const description = product.description || `Mua ${product.name} giá tốt.`;
  const url = `${SITE_URL}/san-pham/${product.slug}`;
  const images = product.imageUrl ? [{ url: product.imageUrl }] : undefined;
  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      offers: { orderBy: { position: "asc" } },
    },
  });

  if (!product || !product.published) notFound();

  // Tách ưu/nhược điểm thành danh sách (mỗi dòng 1 ý).
  const prosList = (product.pros || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const consList = (product.cons || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const discount = discountPercent(product.price, product.salePrice);
  const finalPrice = product.salePrice ?? product.price;

  // JSON-LD Product (giúp Google hiện giá, đánh giá, tình trạng còn hàng)
  const url = `${SITE_URL}/san-pham/${product.slug}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.imageUrl ? { image: [product.imageUrl] } : {}),
    ...(product.store ? { brand: { "@type": "Brand", name: product.store } } : {}),
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            ratingCount: Math.max(1, product.clicks),
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: finalPrice,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url,
    },
  };

  // Sản phẩm liên quan (cùng danh mục)
  const related = await prisma.product.findMany({
    where: {
      published: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });


  let gallery: string[] = [];
  try {
    gallery = product.gallery ? JSON.parse(product.gallery) : [];
  } catch {
    gallery = [];
  }

  return (
    <div className="container py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(productJsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-700">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link href="/san-pham" className="hover:text-brand-700">Sản phẩm</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/san-pham?category=${product.category.slug}`}
              className="hover:text-brand-700"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      {/* ===== KHU TRÊN: ảnh + thông tin ===== */}
      <div className="grid md:grid-cols-[28rem_1fr] gap-8 items-start">
        {/* Ảnh */}
        <ProductGallery
          main={product.imageUrl}
          images={gallery}
          name={product.name}
        />

        {/* Thông tin */}
        <div>
          {product.store && (
            <span className="inline-block bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full">
              {product.store} Official
            </span>
          )}
          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          {(product.rating || product.clicks > 0) && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              {product.rating ? (
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <span>★</span>
                  <span className="text-gray-700">{product.rating.toFixed(1)} / 5.0</span>
                </span>
              ) : null}
              {product.clicks > 0 && (
                <span className="text-gray-400">
                  · {product.clicks.toLocaleString("vi-VN")} lượt quan tâm
                </span>
              )}
            </div>
          )}

          {product.description && (
            <p className="mt-4 text-gray-600">{product.description}</p>
          )}

          {/* Giá */}
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold text-brand-700">
                {formatCurrency(finalPrice)}
              </span>
              {discount && (
                <span className="bg-red-100 text-red-600 text-sm font-semibold px-2.5 py-1 rounded-full">
                  Giảm {discount}%
                </span>
              )}
            </div>
            {product.salePrice && (
              <span className="text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Nút mua chính */}
          <a
            href={`/api/go/${product.id}`}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center w-full max-w-sm bg-brand-600 hover:bg-brand-700 text-white font-semibold px-10 py-3.5 rounded-xl transition"
          >
            Mua ngay {product.store ? `tại ${product.store}` : ""}
          </a>
          <p className="mt-2 text-xs text-gray-400">
            * Khi mua qua liên kết này, chúng tôi có thể nhận hoa hồng mà không làm tăng giá của bạn.
          </p>
        </div>
      </div>

      {/* ===== 3 THẺ: Ưu điểm · Nhược điểm · Ai nên mua (cao bằng nhau, viền trái màu) ===== */}
      {(prosList.length > 0 || consList.length > 0 || product.bestFor) && (
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {prosList.length > 0 && (
            <div className="h-full rounded-xl border border-gray-200 border-l-4 border-l-green-500 bg-white p-5">
              <h3 className="flex items-center gap-2 text-base font-bold text-green-700 mb-3">
                <span>👍</span> Ưu điểm
              </h3>
              <ul className="space-y-2">
                {prosList.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-green-600 shrink-0">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {consList.length > 0 && (
            <div className="h-full rounded-xl border border-gray-200 border-l-4 border-l-red-500 bg-white p-5">
              <h3 className="flex items-center gap-2 text-base font-bold text-red-600 mb-3">
                <span>👎</span> Nhược điểm
              </h3>
              <ul className="space-y-2">
                {consList.map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-red-500 shrink-0">✕</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {product.bestFor && (
            <div className="h-full rounded-xl border border-gray-200 border-l-4 border-l-brand-500 bg-white p-5">
              <h3 className="flex items-center gap-2 text-base font-bold text-brand-700 mb-3">
                <span>🧑</span> Ai nên mua?
              </h3>
              <p className="text-sm text-gray-700">{product.bestFor}</p>
            </div>
          )}
        </div>
      )}

      {/* ===== Mô tả chi tiết (đầy đủ) ===== */}
      {product.content && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả chi tiết</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.content) }}
            />
          </div>
        </section>
      )}

      {/* Bảng so sánh nhanh: so giá sản phẩm này trên các sàn (từ "Link mua ở các sàn") */}
      <ComparisonTable
        productId={product.id}
        productImage={product.imageUrl}
        offers={product.offers.map((o) => ({
          id: o.id,
          store: o.store,
          image: o.image,
          price: o.price,
        }))}
      />

      {/* Liên quan */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
