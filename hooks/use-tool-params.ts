'use client';

import { useCallback, useMemo } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';

/**
 * Syncs tool state to/from URL search params for shareable links.
 * Reads initial values from the URL on mount, and writes back on state changes.
 */
export function useToolParams<T extends Record<string, string>>(
  defaults: T,
): [T, (updates: Partial<T>) => void] {
  const parsers = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(defaults).map(([key, value]) => [
          key,
          parseAsString.withDefault(value),
        ]),
      ),
    [defaults],
  ) as { [K in keyof T]: ReturnType<typeof parseAsString.withDefault> };

  const [state, setState] = useQueryStates(parsers, { shallow: true });

  const setParams = useCallback(
    (updates: Partial<T>) => {
      type SetStateInput = Parameters<typeof setState>[0];
      void setState(updates as SetStateInput);
    },
    [setState],
  );

  return [state as T, setParams];
}
