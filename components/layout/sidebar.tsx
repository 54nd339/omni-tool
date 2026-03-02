'use client';

import { memo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, Settings } from 'lucide-react';
import { TOOL_CATEGORIES, TOOLS } from '@/lib/constants/tools';
import { CHANGELOG } from '@/lib/constants/changelog';
import { getIconOrFallback } from '@/lib/icon-map';
import { useSidebarOpen, useSettingsStore } from '@/stores/settings-store';
import { useMediaQuery } from '@/hooks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { LogoIcon } from './logo';

const SidebarFavorites = memo(function SidebarFavorites({ open }: { open: boolean }) {
  const pathname = usePathname();
  const favoriteIds = useSettingsStore((s) => s.favoriteTools);
  const favTools = favoriteIds
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is (typeof TOOLS)[number] => t !== undefined);

  if (favTools.length === 0) return null;

  return (
    <div className="px-2 pb-1">
      {open && (
        <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Favorites
        </p>
      )}
      {favTools.map((tool) => {
        const Icon = getIconOrFallback(tool.icon);
        const active = pathname === tool.path;
        return (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Link
                href={tool.path}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2 py-1.5 text-xs transition-colors',
                  active
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {open && <span className="truncate">{tool.name}</span>}
              </Link>
            </TooltipTrigger>
            {!open && <TooltipContent side="right">{tool.name}</TooltipContent>}
          </Tooltip>
        );
      })}
      <Separator className="mt-1" />
    </div>
  );
});

const SidebarBookmarks = memo(function SidebarBookmarks({ open }: { open: boolean }) {
  const bookmarks = useSettingsStore((s) => s.toolBookmarks);

  if (bookmarks.length === 0 || !open) return null;

  return (
    <div className="px-2 pb-1">
      <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Bookmarks
      </p>
      {bookmarks.slice(0, 5).map((bm) => {
        const tool = TOOLS.find((t) => t.id === bm.toolId);
        if (!tool) return null;
        const qs = new URLSearchParams(bm.params).toString();
        const href = `${tool.path}${qs ? `?${qs}` : ''}`;
        return (
          <Tooltip key={bm.id}>
            <TooltipTrigger asChild>
              <Link
                href={href}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Bookmark className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{bm.name}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{`${bm.name} (${tool.name})`}</TooltipContent>
          </Tooltip>
        );
      })}
      <Separator className="mt-1" />
    </div>
  );
});

const SidebarFooter = memo(function SidebarFooter({ open }: { open: boolean }) {
  const setChangelogModalOpen = useSettingsStore((s) => s.setChangelogModalOpen);
  const lastSeenVersion = useSettingsStore((s) => s.lastSeenVersion);
  const latestVersion = CHANGELOG[0]?.version ?? '';
  const hasNewVersion = lastSeenVersion !== latestVersion;

  return (
    <div className="mt-auto shrink-0 border-t border-border p-2">
      <div className="flex flex-col gap-1">
        {hasNewVersion && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setChangelogModalOpen(true)}
              >
                <span className="relative inline-flex">
                  <span className="size-2 rounded-full bg-primary" />
                </span>
                {open && <span>What&apos;s New</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">What&apos;s New</TooltipContent>
          </Tooltip>
        )}
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  'flex flex-1 min-h-[44px] sm:min-h-0 h-9 items-center justify-center rounded-md font-medium transition-colors hover:bg-muted',
                  'inline-flex gap-2'
                )}
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
                {open && <span>Settings</span>}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});

const SidebarContent = memo(function SidebarContent({ open }: { open: boolean }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground">
            <LogoIcon className="h-5 w-5" />
          </div>
          {open && (
            <span className="text-sm font-semibold tracking-tight">
              OmniTool
            </span>
          )}
        </Link>
      </div>

      <Separator />

      <ScrollArea className="flex-1 py-2">
        <SidebarFavorites open={open} />
        <SidebarBookmarks open={open} />
        <nav
          className="flex flex-col gap-0.5 px-2"
          role="tree"
          aria-label={open ? 'Tool categories' : 'Tool categories (collapsed)'}
          onKeyDown={(e) => {
            const target = e.target as HTMLElement;
            const items = Array.from(
              target.closest('nav')?.querySelectorAll<HTMLElement>('a') ?? [],
            );
            const idx = items.indexOf(target as HTMLElement);
            if (idx < 0) return;
            if (e.key === 'ArrowDown' && idx < items.length - 1) {
              e.preventDefault();
              items[idx + 1].focus();
            } else if (e.key === 'ArrowUp' && idx > 0) {
              e.preventDefault();
              items[idx - 1].focus();
            }
          }}
        >
          {TOOL_CATEGORIES.map((cat) => {
            const Icon = getIconOrFallback(cat.icon);
            const isActive = pathname.startsWith(cat.path);
            const categoryTools = TOOLS.filter((t) => t.category === cat.id);
            const expanded = open && isActive;

            return (
              <div key={cat.id} role="treeitem" aria-expanded={expanded}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={cat.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors md:py-2',
                        'min-h-[44px] md:min-h-0',
                        isActive
                          ? 'bg-muted font-medium text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {open && <span className="truncate">{cat.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!open && (
                    <TooltipContent side="right">{cat.name}</TooltipContent>
                  )}
                </Tooltip>

                {expanded && (
                  <div
                    role="group"
                    className="ml-5 flex flex-col gap-0.5 border-l border-border pl-3 pt-0.5"
                  >
                    {categoryTools.map((tool) => {
                      const active = pathname === tool.path;
                      return (
                        <Link
                          key={tool.id}
                          href={tool.path}
                          role="treeitem"
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'rounded-md px-2 py-1.5 text-xs transition-colors md:py-1.5',
                            'min-h-[44px] flex items-center md:min-h-0',
                            active
                              ? 'bg-muted font-medium text-foreground'
                              : 'text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {tool.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
      <SidebarFooter open={open} />
    </>
  );
});

export function Sidebar() {
  const pathname = usePathname();
  const open = useSidebarOpen();
  const setSidebarOpen = useSettingsStore((s) => s.setSidebarOpen);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const drawerRef = useRef<HTMLElement>(null);
  const touchRef = useRef<{ startX: number; startTime: number } | null>(null);

  const prevMobileRef = useRef(isMobile);
  useEffect(() => {
    const mobileChanged = prevMobileRef.current !== isMobile;
    prevMobileRef.current = isMobile;

    if (isMobile) {
      setSidebarOpen(false);
    } else if (mobileChanged) {
      setSidebarOpen(true);
    }
  }, [isMobile, pathname, setSidebarOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchRef.current = { startX: e.touches[0].clientX, startTime: Date.now() };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current || !drawerRef.current) return;
    const delta = e.touches[0].clientX - touchRef.current.startX;
    if (delta > 0) {
      drawerRef.current.style.transform = '';
      return;
    }
    drawerRef.current.style.transition = 'none';
    drawerRef.current.style.transform = `translateX(${delta}px)`;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchRef.current || !drawerRef.current) return;
      const delta = e.changedTouches[0].clientX - touchRef.current.startX;
      const elapsed = Date.now() - touchRef.current.startTime;
      const velocity = elapsed > 0 ? (Math.abs(delta) / elapsed) * 1000 : 0;

      if (delta < -80 || (delta < -30 && velocity > 300)) {
        drawerRef.current.style.transition = 'none';
        drawerRef.current.style.transform = 'translateX(-100%)';
        setSidebarOpen(false);
        requestAnimationFrame(() => {
          if (drawerRef.current) {
            drawerRef.current.style.transition = '';
            drawerRef.current.style.transform = '';
          }
        });
      } else {
        drawerRef.current.style.transition = '';
        drawerRef.current.style.transform = '';
      }
      touchRef.current = null;
    },
    [setSidebarOpen],
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          className={cn(
            'fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 md:hidden',
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <aside
          ref={drawerRef}
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-border bg-background touch-pan-y md:hidden',
            'transition-transform duration-[250ms] ease-out',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <SidebarContent open />
        </aside>
      )}

      {/* Desktop sidebar -- CSS transition for width collapse */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-background transition-all duration-200 md:flex',
          open ? 'w-56' : 'w-14',
        )}
      >
        <SidebarContent open={open} />
      </aside>
    </>
  );
}
