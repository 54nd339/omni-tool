'use client';

import { useEffect } from 'react';

export const ServiceWorkerProvider = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (error) {
        console.warn('SW registration failed', error);
      }
    };
    void register();
  }, []);

  return null;
};


