import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    minimumCacheTTL: 2678400,           // 31 days — TMDB images are static
    formats: ["image/webp"],             // Single format (no avif) → halves transformations
    deviceSizes: [640, 750, 1080, 1920], // Reduced from 8 → 4 breakpoints
    imageSizes: [48, 96, 128, 192, 256], // Aligned to actual UI thumbnail sizes
    qualities: [75],                     // Single quality level — TMDB pre-optimizes images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
