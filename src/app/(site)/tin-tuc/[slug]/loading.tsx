// Khung chờ trang chi tiết bài viết.
export default function Loading() {
  return (
    <div className="container py-8 animate-pulse">
      <div className="h-4 w-72 bg-gray-200 rounded mb-6" />
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          <div className="h-9 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-20 bg-gray-200 rounded w-full" />
          <div className="h-72 bg-gray-200 rounded-xl w-full" />
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-11/12" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-56 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
