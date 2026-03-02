'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false);
      setShowBackOnline(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setShowBackOnline(false), 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Online and nothing to show
  if (isOnline && !showBackOnline) return null;

  // Brief "Back online" message
  if (isOnline && showBackOnline) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2 rounded-md bg-green-500/15 px-4 py-2 text-sm text-green-700 dark:text-green-300',
          'mb-4 transition-opacity duration-500',
          showBackOnline ? 'animate-in fade-in-0' : 'opacity-0',
        )}
        role="status"
        aria-live="polite"
      >
        <Wifi className="h-4 w-4 shrink-0" />
        <span>Back online</span>
      </div>
    );
  }

  // Offline banner (dismissed = don't show)
  if (!isOnline && dismissed) return null;

  return (
    <div
      className={cn(
        'mb-4 flex items-center justify-between gap-3 rounded-md bg-amber-500/20 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-200',
        'transition-opacity duration-300',
      )}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>You&apos;re offline. Some tools may have limited functionality.</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss offline notice"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
