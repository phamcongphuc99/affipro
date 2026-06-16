import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Sản phẩm</th>
              <th className="px-4 py-3 font-medium">Danh mục</th>
              <th className="px-4 py-3 font-medium">Giá</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl || "/placeholder.svg"}
                      alt=""
                      className="h-10 w-10 rounded object-cover bg-gray-100"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{p.name}</div>
                      {p.featured && (
                        <span className="text-xs text-amber-600">★ Nổi bật</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {p.category?.name || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">
                    {formatCurrency(p.salePrice ?? p.price)}
                  </div>
                  {p.salePrice && (
                    <div className="text-xs text-gray-400 line-through">
                      {formatCurrency(p.price)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.published ? (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                      Hiển thị
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      Ẩn
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-brand-700 hover:underline"
                  >
                    Sửa
                  </Link>
                  <DeleteButton
                    url={`/api/products/${p.id}`}
                    confirmText={`Xóa sản phẩm "${p.name}"?`}
                  />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
