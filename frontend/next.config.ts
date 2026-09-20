import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  // Desktop apps load from file:// so we need unoptimized images usually
  images: { unoptimized: true },
  devIndicators: false,
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Rewrites are only allowed in development when not using static export
  ...(process.env.NODE_ENV === 'development' ? {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*',
        },
      ];
    }
  } : {}),
};

export default nextConfig;
