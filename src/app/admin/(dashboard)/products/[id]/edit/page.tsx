import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories, allProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { id: Number(params.id) },
      include: { offers: { orderBy: { position: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sửa sản phẩm</h1>
      <ProductForm
        product={product}
        categories={categories}
        allProducts={allProducts}
      />
    </div>
  );
}
