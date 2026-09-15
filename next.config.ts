import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable HTTP compression for all textual assets (HTML, JSON, CSS, JS)
  compress: true,

  // High-performance image optimization (AVIF + WebP)
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24 hours image cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  // Package bundle tree-shaking optimization
  experimental: {
    optimizePackageImports: ["lucide-react", "@prisma/client"],
  },

  // Cache-Control and CDN performance headers
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
