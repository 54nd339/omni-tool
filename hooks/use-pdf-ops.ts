'use client';

import type { PdfWorkerApi } from '@/workers/pdf.worker';
import { createWorkerHook } from './create-worker-hook';

export const usePdfOps = createWorkerHook<PdfWorkerApi>({
  workerKey: 'pdf',
  workerFactory: () =>
    new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'PDF processing failed',
});
