import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cho phép load ảnh từ bất kỳ domain nào (user có thể paste link từ nhiều nguồn)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    // Tắt tối ưu hóa ảnh để giữ nguyên URL gốc (tránh lỗi với external CDN)
    unoptimized: true,
  },
};

export default nextConfig;
