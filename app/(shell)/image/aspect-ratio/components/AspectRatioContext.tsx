'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAspectRatio, UseAspectRatioResult } from '@/app/lib/hooks/useAspectRatio';

const AspectRatioContext = createContext<UseAspectRatioResult | null>(null);

export function AspectRatioProvider({ children }: { children: ReactNode }) {
  const aspectRatio = useAspectRatio();
  return (
    <AspectRatioContext.Provider value={aspectRatio}>
      {children}
    </AspectRatioContext.Provider>
  );
}

export function useAspectRatioContext() {
  const context = useContext(AspectRatioContext);
  if (!context) {
    throw new Error('useAspectRatioContext must be used within AspectRatioProvider');
  }
  return context;
}

