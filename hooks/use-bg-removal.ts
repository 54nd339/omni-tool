'use client';

import { useCallback } from 'react';
import * as Comlink from 'comlink';
import type { BgRemovalWorkerApi } from '@/workers/bg-removal.worker';
import { createWorkerHook } from './create-worker-hook';

const useWorker = createWorkerHook<BgRemovalWorkerApi>({
  workerKey: 'bg-removal',
  workerFactory: () =>
    new Worker(new URL('../workers/bg-removal.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'Background removal failed',
});

export function useBgRemoval() {
  const { run, terminate, status, progress, error, setProgress, getApi } =
    useWorker();

  const removeBackground = useCallback(
    async (input: Blob): Promise<Blob> => {
      return run(async (api) => {
        return api.removeBackground(
          input,
          Comlink.proxy((p: number) => setProgress(Math.round(p * 100))),
        );
      });
    },
    [run, setProgress],
  );

  return { removeBackground, terminate, status, progress, error };
}
