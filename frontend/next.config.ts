import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Desktop apps load from file:// so we need unoptimized images usually
  images: { unoptimized: true },
  devIndicators: false,
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
