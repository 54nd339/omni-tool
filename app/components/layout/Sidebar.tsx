'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Cpu, Zap } from 'lucide-react';
import { cn } from '@/app/utils/cn';
import { NAV_ITEMS } from '@/app/lib/constants';
import { buildActiveRouteMap } from '@/app/lib/utils/navigation';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const pathname = usePathname();
  const activeMap = useMemo(() => buildActiveRouteMap(pathname), [pathname]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={toggle} />}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="h-full flex flex-col">
          <Link href="/" className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <Zap className="w-6 h-6 text-indigo-500 mr-2" />
            <span className="font-bold text-xl dark:text-white">OmniTool</span>
          </Link>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const parentActive = activeMap.has(item.href);
              return (
                <div key={item.href}>
                  <Link
                    href={item.href as any}
                    onClick={() => {
                      if (window.innerWidth < 1024) toggle();
                    }}
                    className={cn(
                      'w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      parentActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
                    )}
                  >
                    <item.icon className={cn('w-5 h-5 mr-3', parentActive ? 'text-indigo-500' : 'text-slate-400')} />
                    {item.label}
                    {parentActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                  {item.children && parentActive && (
                    <div className="mt-1 ml-3 space-y-1">
                      {item.children.map((child) => {
                        const childActive = activeMap.has(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href as any}
                            onClick={() => {
                              if (window.innerWidth < 1024) toggle();
                            }}
                            className={cn(
                              'block px-4 py-2 rounded-lg text-sm transition-colors',
                              childActive
                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-2">
                <Cpu className="w-3 h-3" /> System Status
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Storage</span>
                <span className="text-emerald-500">Local Only</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Network</span>
                <span className="text-slate-800 dark:text-white font-mono">Offline Ready</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

