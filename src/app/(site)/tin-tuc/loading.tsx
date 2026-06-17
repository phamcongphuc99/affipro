// Khung chờ hiển thị tức thì khi chuyển sang trang Tin tức.
export default function Loading() {
  return (
    <div className="container py-10 animate-pulse">
      <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-72 bg-gray-200 rounded mb-8" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="aspect-video bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
