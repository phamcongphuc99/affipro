import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Thêm sản phẩm</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
