'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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

  const state = useMemo(() => {
    const nextState = { ...defaults } as T;
    for (const key of Object.keys(defaults)) {
      const value = searchParams.get(key);
      if (value !== null) {
        (nextState as Record<string, string>)[key] = value;
      }
    }

    return nextState;
  }, [defaults, searchParams]);

  const setParams = useCallback(
    (updates: Partial<T>) => {
      const next = { ...state, ...updates };
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (value && value !== (defaults as Record<string, string>)[key]) {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [defaults, pathname, router, state],
  );

  return [state, setParams];
}
