'use client';

import React, { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from '@/app/components/layout/AppHeader';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { useAppStore } from '@/app/store/appStore';

const titleMap: Record<string, string> = {
  image: 'Image Tools',
  'background-removal': 'Background Removal',
  resize: 'Resize & Compress',
  icons: 'Icon Generator',
  convert: 'Format Conversion',
  crypto: 'Cryptography',
  cipher: 'Cipher Tools',
  url: 'URL & Base64',
  jwt: 'JWT Tools',
  hash: 'Hash Generator',
  dev: 'Developer Utilities',
  json: 'JSON Validator',
  yaml: 'YAML Validator',
  xml: 'XML Validator',
  diff: 'Diff Checker',
  time: 'Timestamp & Cron',
  docs: 'PDF + Docs',
  merge: 'Merge PDFs',
  split: 'Split / Reorder',
  repair: 'Compress / Repair',
  media: 'Audio / Video Lab',
  whiteboard: 'Whiteboard',
};

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, isOnline, sidebarOpen, toggleSidebar, setTheme, setOnlineStatus } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleStatus = () => setOnlineStatus(navigator.onLine);
    handleStatus();
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, [setOnlineStatus]);

  const title = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || 'dashboard';
    return titleMap[last] ?? last;
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AppHeader
          title={title}
          isOnline={isOnline}
          theme={theme}
          onToggleSidebar={toggleSidebar}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}


