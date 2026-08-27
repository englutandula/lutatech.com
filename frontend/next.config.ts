import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // Desktop apps load from file:// so we need unoptimized images usually
  images: { unoptimized: true },
};

export default nextConfig;
