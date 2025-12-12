import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client-only app shell; all routes are static and offline-ready.
  output: "export",
  trailingSlash: true,
  
  // Headers for Cross-Origin Isolation (required for SharedArrayBuffer/FFmpeg)
  async headers() {
    // Only add headers in development (static exports can't set headers)
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cross-Origin-Opener-Policy',
              value: 'same-origin',
            },
            {
              key: 'Cross-Origin-Embedder-Policy',
              value: 'require-corp',
            },
          ],
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
