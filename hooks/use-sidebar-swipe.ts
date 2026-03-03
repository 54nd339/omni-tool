'use client';

import { useCallback, useRef } from 'react';

export function useSidebarSwipe(setSidebarOpen: (open: boolean) => void) {
  const drawerRef = useRef<HTMLElement>(null);
  const touchRef = useRef<{ startX: number; startTime: number } | null>(null);

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

  return {
    drawerRef,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
  };
}