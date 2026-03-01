'use client';

import { useCallback } from 'react';
import * as Comlink from 'comlink';
import type { OcrWorkerApi } from '@/workers/ocr.worker';
import { createWorkerHook } from './create-worker-hook';

const useWorker = createWorkerHook<OcrWorkerApi>({
  workerKey: 'ocr',
  workerFactory: () =>
    new Worker(new URL('../workers/ocr.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'OCR recognition failed',
});

export function useOcr() {
  const { run, terminate, status, progress, error, setProgress } = useWorker();

  const recognize = useCallback(
    async (image: Blob, lang: string): Promise<string> => {
      return run(async (api) => {
        return api.recognize(
          image,
          lang,
          Comlink.proxy((p: number) => setProgress(Math.round(p * 100))),
        );
      });
    },
    [run, setProgress],
  );

  return { recognize, terminate, status, progress, error };
}
