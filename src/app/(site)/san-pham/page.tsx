import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/site/ProductCard";
import Pagination from "@/components/site/Pagination";

export const metadata: Metadata = { title: "Sản phẩm" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12; // 3 hàng x 4 sản phẩm mỗi trang

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; page?: string };
}) {
  const { category, search } = searchParams;

  const where: any = { published: true };
  if (category) where.category = { slug: category };
  if (search) where.name = { contains: search };

  // Tổng số sản phẩm khớp điều kiện -> tính số trang
  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(
    Math.max(1, Number(searchParams.page) || 1),
    totalPages
  );

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sản phẩm</h1>

      {/* Lọc danh mục (trái) + tìm kiếm (phải) cùng một hàng */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Lọc danh mục */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/san-pham"
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
              !category
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white border-gray-200 text-gray-600 hover:border-brand-400"
            }`}
          >
            Tất cả
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/san-pham?category=${c.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                category === c.slug
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white border-gray-200 text-gray-600 hover:border-brand-400"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Thanh tìm kiếm */}
        <form
          action="/san-pham"
          method="get"
          className="flex gap-2 w-full md:w-auto md:shrink-0"
        >
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Tìm sản phẩm..."
            className="flex-1 md:w-64 rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
          <button className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700">
            Tìm
          </button>
        </form>
      </div>

      {products.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-gray-500">
            Hiển thị {(page - 1) * PAGE_SIZE + 1}–
            {(page - 1) * PAGE_SIZE + products.length} trong {total} sản phẩm
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/san-pham"
            params={{ category, search }}
          />
        </>
      ) : (
        <p className="text-gray-500 py-10 text-center">
          Không tìm thấy sản phẩm nào.
        </p>
      )}
    </div>
  );
}
