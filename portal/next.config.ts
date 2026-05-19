import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    localPatterns: [{ pathname: "/covers/**" }],
  },
  async headers() {
    return [
      {
        source: "/flipbook/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, private",
          },
        ],
      },
      {
        source: "/api/publications/:path*/content",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, private",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
