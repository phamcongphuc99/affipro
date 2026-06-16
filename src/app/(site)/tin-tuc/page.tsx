import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/site/PostCard";

export const metadata: Metadata = { title: "Tin tức" };
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Tin tức</h1>
      <p className="text-gray-600 mb-8">
        Cập nhật mẹo mua sắm, đánh giá sản phẩm và xu hướng mới nhất.
      </p>

      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 py-10 text-center">Chưa có bài viết nào.</p>
      )}
    </div>
  );
}
