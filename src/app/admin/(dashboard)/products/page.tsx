import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductsTable from "@/components/admin/ProductsTable";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">
          Sản phẩm ({products.length})
        </h1>
        <Link
          href="/admin/products/new"
          className="bg-brand-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-brand-700"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      <ProductsTable products={products} categories={categories} />
    </div>
  );
}
