//next.config.js

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true        // ✅ Required since `next/image` optimization needs Node server
  },
  eslint: {
    ignoreDuringBuilds: true // ✅ Skip ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true  // ✅ Skip TypeScript errors during build
  }
};

export default nextConfig;

