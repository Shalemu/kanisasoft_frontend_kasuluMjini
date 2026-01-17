//next.config.js

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',          // ✅ Required for static export in Next.js 13+
  trailingSlash: true,       // ✅ Ensures `/about` becomes `/about/index.html`
  images: {
    unoptimized: true        // ✅ Required since `next/image` optimization needs Node server
  }
};

export default nextConfig;

