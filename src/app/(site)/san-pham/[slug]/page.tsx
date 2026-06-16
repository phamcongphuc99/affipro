import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, discountPercent } from "@/lib/utils";
import ProductCard from "@/components/site/ProductCard";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });
  if (!product) return { title: "Không tìm thấy sản phẩm" };
  return {
    title: product.name,
    description: product.description || undefined,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product || !product.published) notFound();

  const discount = discountPercent(product.price, product.salePrice);
  const finalPrice = product.salePrice ?? product.price;

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

      <div className="grid md:grid-cols-2 gap-10">
        {/* Ảnh */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {gallery.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {gallery.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  className="aspect-square rounded-lg object-cover border border-gray-200"
                />
              ))}
            </div>
          )}
        </div>

        {/* Thông tin */}
        <div>
          {product.store && (
            <span className="inline-block bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1 rounded-full">
              {product.store}
            </span>
          )}
          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          {product.rating ? (
            <div className="flex items-center gap-1 mt-2 text-amber-500">
              <span>★</span>
              <span className="text-gray-700 font-medium">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-gray-400 text-sm">/ 5</span>
            </div>
          ) : null}

          {product.description && (
            <p className="mt-4 text-gray-600">{product.description}</p>
          )}

          <div className="mt-6 flex items-end gap-3">
            <span className="text-3xl font-bold text-brand-700">
              {formatCurrency(finalPrice)}
            </span>
            {product.salePrice && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                {discount && (
                  <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                    -{discount}%
                  </span>
                )}
              </>
            )}
          </div>

          <a
            href={`/api/go/${product.id}`}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white font-semibold px-10 py-3.5 rounded-xl transition"
          >
            Mua ngay {product.store ? `tại ${product.store}` : ""}
          </a>
          <p className="mt-2 text-xs text-gray-400">
            * Khi mua qua liên kết này, chúng tôi có thể nhận hoa hồng mà không làm tăng giá của bạn.
          </p>
        </div>
      </div>

      {/* Mô tả chi tiết */}
      {product.content && (
        <div className="mt-12 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả chi tiết</h2>
          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: product.content }}
          />
        </div>
      )}

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
