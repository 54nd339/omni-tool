'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function SwUpdater() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            toast('New version available', {
              description: 'Reload to get the latest features.',
              action: {
                label: 'Reload',
                onClick: () => window.location.reload(),
              },
              duration: Infinity,
            });
          }
        });
      });
    });
  }, []);

  return null;
}
