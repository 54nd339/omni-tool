import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false,
  fallbacks: { document: '/_offline' },
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
    maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/unpkg\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'unpkg-cdn-assets',
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\.wasm$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'wasm-assets',
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /tessdata.*\.traineddata/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'tesseract-data',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /\.(js|css|woff2?)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-assets',
          expiration: { maxEntries: 100, maxAgeSeconds: 3 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-assets',
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ['@excalidraw/excalidraw'],
  ...(process.env.NODE_ENV === 'development'
    ? {
      async headers() {
        return [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'Cross-Origin-Embedder-Policy',
                value: 'require-corp',
              },
              {
                key: 'Cross-Origin-Opener-Policy',
                value: 'same-origin',
              },
            ],
          },
        ];
      },
    }
    : {}),
};

export default withPWA(nextConfig);
