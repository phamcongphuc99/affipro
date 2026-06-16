/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Cho phép hiển thị ảnh từ mọi domain (ảnh affiliate thường từ nhiều nguồn).
    // Trong môi trường production nên giới hạn lại danh sách domain cụ thể.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
