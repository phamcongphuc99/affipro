import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, allProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Thêm sản phẩm</h1>
      <ProductForm categories={categories} allProducts={allProducts} />
    </div>
  );
}
