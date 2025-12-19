'use client';

import { type FC, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown, Zap } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { NAV_ITEMS } from '@/app/lib/constants';
import { useActiveRoute } from '@/app/lib/hooks';
import { SidebarProps } from '@/app/lib/types';

export const Sidebar: FC<SidebarProps> = ({ isOpen, toggle }) => {
  const pathname = usePathname();
  const activeMap = useActiveRoute(pathname);
  const [collapsedMenus, setCollapsedMenus] = useState<Set<string>>(new Set());
  const [manuallyExpandedMenus, setManuallyExpandedMenus] = useState<Set<string>>(new Set());

  // Auto-expand menus that have active children
  const autoExpandedMenus = useMemo(() => {
    const newExpanded = new Set<string>();
    NAV_ITEMS.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => activeMap.has(child.href));
        if (hasActiveChild || activeMap.has(item.href)) {
          newExpanded.add(item.href);
        }
      }
    });
    return newExpanded;
  }, [activeMap]);

  // Compute effective expanded menus: (auto-expanded OR manually expanded) AND not collapsed
  const effectiveExpandedMenus = useMemo(() => {
    const merged = new Set(autoExpandedMenus);
    manuallyExpandedMenus.forEach((href) => merged.add(href));
    collapsedMenus.forEach((href) => merged.delete(href));
    return merged;
  }, [autoExpandedMenus, manuallyExpandedMenus, collapsedMenus]);

  const toggleMenu = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlyExpanded = effectiveExpandedMenus.has(href);
    
    if (isCurrentlyExpanded) {
      // User wants to collapse it
      setCollapsedMenus((prev) => new Set(prev).add(href));
      setManuallyExpandedMenus((prev) => {
        const next = new Set(prev);
        next.delete(href);
        return next;
      });
    } else {
      // User wants to expand it
      setCollapsedMenus((prev) => {
        const next = new Set(prev);
        next.delete(href);
        return next;
      });
      setManuallyExpandedMenus((prev) => new Set(prev).add(href));
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={toggle} />}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out overflow-hidden',
          'lg:h-screen lg:max-h-screen',
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0',
        )}
      >
        <div className="h-full max-h-screen flex flex-col overflow-hidden">
          <Link href="/" className="h-16 flex-shrink-0 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <Zap className="w-6 h-6 text-indigo-500 mr-2" />
            <span className="font-bold text-xl dark:text-white">OmniTool</span>
          </Link>

          <nav className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto overflow-x-hidden scroll-smooth">
            {NAV_ITEMS.map((item) => {
              const parentActive = activeMap.has(item.href);
              const isExpanded = effectiveExpandedMenus.has(item.href);
              const hasChildren = item.children && item.children.length > 0;
              
              return (
                <div key={item.href}>
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) toggle();
                      }}
                      className={cn(
                        'flex-1 flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        parentActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
                      )}
                    >
                      <item.icon className={cn('w-5 h-5 mr-3', parentActive ? 'text-indigo-500' : 'text-slate-400')} />
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <button
                        onClick={(e) => toggleMenu(item.href, e)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          parentActive
                            ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                        )}
                        aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {hasChildren && isExpanded && (
                    <div className="mt-1 ml-3 space-y-1">
                      {item.children!.map((child) => {
                        const childActive = activeMap.has(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
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

          <div className="flex-shrink-0 p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
              <Link
                href="https://sandeepswain.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors block mb-1"
              >
                Built with 💖 by Sandeep
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                © {new Date().getFullYear()} Sandeep Swain
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
