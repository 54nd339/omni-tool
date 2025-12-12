'use client';

import { type FC } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { AppHeaderProps } from '@/app/lib/types';
import { Button } from '@/app/components/shared';

export const AppHeader: FC<AppHeaderProps> = ({
  title,
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
