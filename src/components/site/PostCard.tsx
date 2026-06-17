import Link from "next/link";
import { formatDate } from "@/lib/utils";
import SafeImage from "./SafeImage";

interface PostCardProps {
  post: {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: Date | string | null;
    createdAt: Date | string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
      <Link href={`/tin-tuc/${post.slug}`} className="block aspect-video overflow-hidden bg-gray-100">
        <SafeImage
          src={post.coverImage}
          alt={post.title}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
        />
      </Link>
      <div className="p-5">
        <time className="text-xs text-gray-400">
          {formatDate(post.publishedAt || post.createdAt)}
        </time>
        <Link href={`/tin-tuc/${post.slug}`}>
          <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-700">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
        )}
        <Link
          href={`/tin-tuc/${post.slug}`}
          className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline"
        >
          Đọc tiếp →
        </Link>
      </div>
    </article>
  );
}
