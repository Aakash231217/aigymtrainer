import type { NextConfig } from "next";
// Use require for next-pwa instead of import since it doesn't have TypeScript types
const withPWA = require('next-pwa');

// Configure PWA
const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=self'
          }
        ]
      }
    ]
  },
  // Configure output for static export when building for Play Store
  output: process.env.EXPORT_MODE === 'static' ? 'export' : undefined,
  // Disable image optimization for static export if needed
  images: process.env.EXPORT_MODE === 'static' ? { unoptimized: true } : {},
  // Include all trailingSlash to avoid redirect issues in static exports
  trailingSlash: process.env.EXPORT_MODE === 'static'
};

// Apply PWA configuration and export the combined config
module.exports = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})(nextConfig);
