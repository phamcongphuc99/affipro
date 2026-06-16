import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const [productCount, postCount, categoryCount, topProducts] =
    await Promise.all([
      prisma.product.count(),
      prisma.post.count(),
      prisma.category.count(),
      prisma.product.findMany({
        orderBy: { clicks: "desc" },
        take: 5,
        where: { clicks: { gt: 0 } },
      }),
    ]);

  const stats = [
    { label: "Sản phẩm", value: productCount, href: "/admin/products", color: "bg-blue-500" },
    { label: "Bài viết", value: postCount, href: "/admin/posts", color: "bg-emerald-500" },
    { label: "Danh mục", value: categoryCount, href: "/admin/categories", color: "bg-amber-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan</h1>

      <div className="grid sm:grid-cols-3 gap-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
          >
            <div className={`h-10 w-10 rounded-lg ${s.color} mb-3`} />
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Sản phẩm được bấm mua nhiều nhất
        </h2>
        {topProducts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Sản phẩm</th>
                <th className="pb-2">Giá</th>
                <th className="pb-2 text-right">Lượt bấm</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-gray-800">{p.name}</td>
                  <td className="py-2.5 text-gray-600">
                    {formatCurrency(p.salePrice ?? p.price)}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-brand-700">
                    {p.clicks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">
            Chưa có lượt bấm mua nào được ghi nhận.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="bg-brand-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-brand-700"
        >
          + Thêm sản phẩm
        </Link>
        <Link
          href="/admin/posts/new"
          className="bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-700"
        >
          + Viết bài mới
        </Link>
      </div>
    </div>
  );
}
