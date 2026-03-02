'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

/**
 * Syncs tool state to/from URL search params for shareable links.
 * Reads initial values from the URL on mount, and writes back on state changes.
 */
export function useToolParams<T extends Record<string, string>>(
  defaults: T,
): [T, (updates: Partial<T>) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const stateRef = useRef<T>({ ...defaults });

  // Read initial values from URL
  const state = { ...defaults } as T;
  for (const key of Object.keys(defaults)) {
    const val = searchParams.get(key);
    if (val !== null) {
      (state as Record<string, string>)[key] = val;
    }
  }
  stateRef.current = state;

  const setParams = useCallback(
    (updates: Partial<T>) => {
      const next = { ...stateRef.current, ...updates };
      stateRef.current = next as T;
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (value && value !== (defaults as Record<string, string>)[key]) {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [pathname, router, defaults],
  );

  return [state, setParams];
}
