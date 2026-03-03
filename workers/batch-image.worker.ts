import * as Comlink from 'comlink';

import {
  type Operation,
  type OutputFormat,
  processImage,
} from '@/lib/image/batch-image';

export interface BatchImageWorkerItemResult {
  error?: string;
  index: number;
  result?: Blob;
  status: 'done' | 'error';
}

interface BatchImageWorkerParams {
  concurrency: number;
  files: File[];
  format: OutputFormat;
  height: number;
  operation: Operation;
  quality: number;
  width: number;
}

type BatchImageResultCallback = (item: BatchImageWorkerItemResult) => void;

export interface BatchImageWorkerApi {
  processBatch: (
    params: BatchImageWorkerParams,
    onItemResult?: BatchImageResultCallback,
  ) => Promise<void>;
}

const api: BatchImageWorkerApi = {
  async processBatch(params, onItemResult) {
    let index = 0;

    const runNext = async (): Promise<void> => {
      while (index < params.files.length) {
        const currentIndex = index;
        index += 1;
        const currentFile = params.files[currentIndex];

        try {
          const result = await processImage(
            currentFile,
            params.operation,
            params.width,
            params.height,
            params.format,
            params.quality,
          );

          onItemResult?.({
            index: currentIndex,
            result,
            status: 'done',
          });
        } catch (error) {
          onItemResult?.({
            error: error instanceof Error ? error.message : 'Failed',
            index: currentIndex,
            status: 'error',
          });
        }
      }
    };

    await Promise.all(
      Array.from(
        { length: Math.min(params.concurrency, params.files.length) },
        () => runNext(),
      ),
    );
  },
};

Comlink.expose(api);
