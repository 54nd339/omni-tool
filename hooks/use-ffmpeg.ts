'use client';

import { useCallback } from 'react';
import * as Comlink from 'comlink';

import {
  type ConvertOptions,
  type PadOptions,
  type ResizeOptions,
} from '@/lib/ffmpeg/image-ops';
import type {
  MediaConvertOptions,
  MediaSplitPoint,
} from '@/lib/ffmpeg/media-ops';
import type { FFmpegWorkerApi } from '@/workers/ffmpeg.worker';

import { createWorkerHook } from './create-worker-hook';

/** Direct API surface matching the worker's previous interface. */
interface FFmpegApi {
  resizeImage(input: Blob, options: ResizeOptions): Promise<Blob>;
  convertImage(input: Blob, options: ConvertOptions): Promise<Blob>;
  padImage(input: Blob, options: PadOptions): Promise<Blob>;
  adjustQuality(input: Blob, quality: number, format: string): Promise<Blob>;
  convertMedia(input: Blob, options: MediaConvertOptions): Promise<Blob>;
  mergeMedia(inputs: { file: Blob; name: string }[], outputFormat: string): Promise<Blob>;
  splitMedia(input: Blob, points: MediaSplitPoint[], outputFormat: string): Promise<Blob[]>;
}

const useFFmpegWorker = createWorkerHook<FFmpegWorkerApi>({
  workerKey: 'ffmpeg',
  workerFactory: () =>
    new Worker(new URL('../workers/ffmpeg.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'FFmpeg processing failed',
});

export function useFFmpeg() {
  const { error, progress, run, setProgress, status } = useFFmpegWorker();

  const runWithProgress = useCallback(
    async <T>(fn: (api: FFmpegApi) => Promise<T>): Promise<T> =>
      run((api) => {
        const onProgress = Comlink.proxy((update: { ratio: number }) => {
          setProgress(Math.round(update.ratio * 100));
        });

        const proxiedApi: FFmpegApi = {
          resizeImage: (input, options) => api.resizeImage(input, options, onProgress),
          convertImage: (input, options) => api.convertImage(input, options, onProgress),
          padImage: (input, options) => api.padImage(input, options, onProgress),
          adjustQuality: (input, quality, format) =>
            api.adjustQuality(input, quality, format, onProgress),
          convertMedia: (input, options) => api.convertMedia(input, options, onProgress),
          mergeMedia: (inputs, outputFormat) =>
            api.mergeMedia(inputs, outputFormat, onProgress),
          splitMedia: (input, points, outputFormat) =>
            api.splitMedia(input, points, outputFormat, onProgress),
        };

        return fn(proxiedApi);
      }),
    [run, setProgress],
  );

  return { error, progress, run: runWithProgress, setProgress, status };
}
