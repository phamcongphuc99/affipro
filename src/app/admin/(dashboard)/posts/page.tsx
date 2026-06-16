import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/posts/${p.id}/edit`}
                    className="text-brand-700 hover:underline"
                  >
                    Sửa
                  </Link>
                  <DeleteButton
                    url={`/api/posts/${p.id}`}
                    confirmText={`Xóa bài "${p.title}"?`}
                  />
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  Chưa có bài viết nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
