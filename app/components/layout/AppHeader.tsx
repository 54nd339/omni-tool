'use client';

import React from 'react';
import { Menu, Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import { AppTheme } from '@/app/store/appStore';

interface AppHeaderProps {
  title: string;
  isOnline: boolean;
  theme: AppTheme;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  isOnline,
  theme,
  onToggleTheme,
  onToggleSidebar,
}) => (
  <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
    <div className="flex items-center gap-4">
      <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
        <Menu className="w-6 h-6" />
      </button>
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

      <button
        onClick={onToggleTheme}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  </header>
);

