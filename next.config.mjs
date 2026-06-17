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
  // HTTP security headers cơ bản
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Chống nhúng site vào iframe (clickjacking)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Chặn trình duyệt đoán sai kiểu file
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Hạn chế rò rỉ referrer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Hạn chế quyền truy cập thiết bị
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
