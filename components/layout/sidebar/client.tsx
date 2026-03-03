'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useMediaQuery } from '@/hooks/use-media-query';
import { useSidebarSwipe } from '@/hooks/use-sidebar-swipe';
import { cn } from '@/lib/utils';
import { useSettingsStore, useSidebarOpen } from '@/stores/settings-store';

import { SidebarContentClient } from './content-client';

export function SidebarClient() {
  const pathname = usePathname();
  const open = useSidebarOpen();
  const setSidebarOpen = useSettingsStore((state) => state.setSidebarOpen);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const { drawerRef, handleTouchEnd, handleTouchMove, handleTouchStart } =
    useSidebarSwipe(setSidebarOpen);

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

  return (
    <>
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
          <SidebarContentClient open />
        </aside>
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-background transition-all duration-200 md:flex',
          open ? 'w-56' : 'w-14',
        )}
      >
        <SidebarContentClient open={open} />
      </aside>
    </>
  );
}
