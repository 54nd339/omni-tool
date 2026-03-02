import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/providers/theme-provider';
import { Shell } from '@/components/layout/shell';
import { GlobalShortcuts } from '@/components/layout/global-shortcuts';
import { SwUpdater } from '@/components/layout/sw-updater';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'OmniTool — Offline Toolbox',
    template: '%s | OmniTool',
  },
  description:
    'Offline-first PWA toolbox — image studio, PDF suite, media lab, crypto, and dev utils. Runs entirely in your browser.',
  metadataBase: new URL('https://tools.sandeepswain.dev'),
  icons: [
    { rel: 'icon', url: '/favicon.ico', sizes: '32x32' },
    { rel: 'icon', url: '/logo.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', url: '/icons/apple-touch-icon.png' },
  ],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OmniTool',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className="min-h-dvh bg-background font-sans text-foreground antialiased"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <NuqsAdapter>
            <Shell>{children}</Shell>
          </NuqsAdapter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'border-border bg-background text-foreground',
            }}
          />
          <GlobalShortcuts />
          <SwUpdater />
        </ThemeProvider>
      </body>
    </html>
  );
}
