'use client';

import { type FC } from 'react';
import { Menu, Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import { AppHeaderProps } from '@/app/lib/types';
import { Button } from '@/app/components/shared';

export const AppHeader: FC<AppHeaderProps> = ({
  title,
  isOnline,
  theme,
  onToggleTheme,
  onToggleSidebar,
}) => (
  <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
    <div className="flex items-center gap-4">
      <Button onClick={onToggleSidebar} variant="ghost" className="p-2" title="Toggle Sidebar">
        <Menu className="w-6 h-6" />
      </Button>
      <h2 className="font-semibold text-lg hidden sm:block capitalize">{title}</h2>
    </div>

    <div className="flex items-center gap-3">
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          isOnline
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}
      >
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline Mode'}</span>
      </div>

      <Button
        onClick={onToggleTheme}
        variant="ghost"
        className="p-2"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
    </div>
  </header>
);

