import type { NextConfig } from 'next';
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  cacheStartUrl: true,
  dynamicStartUrl: true,
  dynamicStartUrlRedirect: "/login"
});

export default withPWA({
  // Your Next.js config
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: '*',
      },
    ],
  },
  devIndicators: false,
  experimental: {
    viewTransition: true,
  },
  webpack: (config) => {
    // Override the default webpack configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node$": false, // Disable onnxruntime-node for browser environments
      "sharp$": false, // optional - Disable sharp package (used by some image processing packages)
    };
    return config;
  }
}) as NextConfig

