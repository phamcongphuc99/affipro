// Khung chờ mặc định cho các trang công khai chưa có loading riêng.
export default function Loading() {
  return (
    <div className="container py-12 animate-pulse">
      <div className="h-8 w-1/3 bg-gray-200 rounded mb-6" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-11/12" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
