import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-brand-600">404</h1>
      <p className="mt-3 text-lg text-gray-600">
        Không tìm thấy trang bạn yêu cầu.
      </p>
      <Link
        href="/"
        className="mt-6 bg-brand-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-700"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
