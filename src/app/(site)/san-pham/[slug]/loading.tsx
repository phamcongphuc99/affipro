// Khung chờ trang chi tiết sản phẩm.
export default function Loading() {
  return (
    <div className="container py-8 animate-pulse">
      <div className="h-4 w-64 bg-gray-200 rounded mb-6" />
      <div className="grid md:grid-cols-[28rem_1fr] gap-8">
        <div className="aspect-square rounded-2xl bg-gray-200 max-w-md w-full" />
        <div className="space-y-4">
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-10 bg-gray-200 rounded w-1/2 mt-6" />
          <div className="h-12 bg-gray-200 rounded-xl w-48 mt-4" />
        </div>
      </div>
    </div>
  );
}
