import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = (searchParams.search || "").trim();

  const products = await prisma.product.findMany({
    where: search ? { name: { contains: search } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

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

      {/* Ô tìm kiếm theo tên sản phẩm (LIKE) */}
      <form method="get" className="mb-5 flex gap-2 max-w-md">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Tìm sản phẩm theo tên..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        />
        <button className="bg-brand-600 text-white px-5 rounded-lg font-medium hover:bg-brand-700">
          Tìm
        </button>
        {search && (
          <Link
            href="/admin/products"
            className="px-4 flex items-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Xóa lọc
          </Link>
        )}
      </form>

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
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 transition"
                    >
                      ✎ Sửa
                    </Link>
                    <DeleteButton
                      url={`/api/products/${p.id}`}
                      label="🗑 Xóa"
                      confirmText={`Xóa sản phẩm "${p.name}"?`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  {search
                    ? `Không tìm thấy sản phẩm nào khớp "${search}".`
                    : "Chưa có sản phẩm nào."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
