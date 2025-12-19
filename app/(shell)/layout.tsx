'use client';

import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader, Sidebar } from '@/app/components/layout';
import { useAppStore } from '@/app/store/appStore';
import { PAGE_CONFIGS } from '@/app/lib/constants';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, sidebarOpen, toggleSidebar, setTheme } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const title = useMemo(() => {
    if (PAGE_CONFIGS[pathname]) {
      return PAGE_CONFIGS[pathname].title;
    }

    const parts = pathname.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : 'Dashboard';
  }, [pathname]);

  return (
    <div className="h-screen max-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AppHeader
          title={title}
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
