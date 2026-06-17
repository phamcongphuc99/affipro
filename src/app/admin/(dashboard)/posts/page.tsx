import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PostsTable from "@/components/admin/PostsTable";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      views: true,
      published: true,
      publishedAt: true,
      createdAt: true,
    },
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

      <PostsTable posts={posts} />
    </div>
  );
}
