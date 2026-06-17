import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = (searchParams.search || "").trim();

  const posts = await prisma.post.findMany({
    where: search ? { title: { contains: search } } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">
          Tin tức ({posts.length})
        </h1>
        <Link
          href="/admin/posts/new"
          className="bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-700"
        >
          + Viết bài mới
        </Link>
      </div>

      {/* Ô tìm kiếm theo tiêu đề bài viết (LIKE) */}
      <form method="get" className="mb-5 flex gap-2 max-w-md">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Tìm bài viết theo tiêu đề..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        />
        <button className="bg-emerald-600 text-white px-5 rounded-lg font-medium hover:bg-emerald-700">
          Tìm
        </button>
        {search && (
          <Link
            href="/admin/posts"
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
              <th className="px-4 py-3 font-medium">Bài viết</th>
              <th className="px-4 py-3 font-medium">Ngày</th>
              <th className="px-4 py-3 font-medium">Lượt xem</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.coverImage || "/placeholder.svg"}
                      alt=""
                      className="h-10 w-16 rounded object-cover bg-gray-100"
                    />
                    <span className="font-medium text-gray-800 line-clamp-2">
                      {p.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(p.publishedAt || p.createdAt)}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.views}</td>
                <td className="px-4 py-3">
                  {p.published ? (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                      Đã xuất bản
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      Nháp
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/posts/${p.id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 transition"
                    >
                      ✎ Sửa
                    </Link>
                    <DeleteButton
                      url={`/api/posts/${p.id}`}
                      label="🗑 Xóa"
                      confirmText={`Xóa bài "${p.title}"?`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  {search
                    ? `Không tìm thấy bài viết nào khớp "${search}".`
                    : "Chưa có bài viết nào."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
