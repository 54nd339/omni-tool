'use client';

import { useCallback } from 'react';
import * as Comlink from 'comlink';

import type { Operation, OutputFormat } from '@/lib/image/batch-image';
import type { CompressFormat } from '@/lib/image/image-editor';
import type { AspectRatioPadWorkerApi } from '@/workers/aspect-ratio-pad.worker';
import type {
  BatchImageWorkerApi,
  BatchImageWorkerItemResult,
} from '@/workers/batch-image.worker';
import type { BgRemovalWorkerApi } from '@/workers/bg-removal.worker';
import type { ColorPaletteWorkerApi } from '@/workers/color-palette.worker';
import type { IconGenWorkerApi } from '@/workers/icon-gen.worker';
import type { ImageCompressWorkerApi } from '@/workers/image-compress.worker';
import type { ImageMetadataWorkerApi } from '@/workers/image-metadata.worker';
import type { OcrWorkerApi } from '@/workers/ocr.worker';
import type { PdfWorkerApi } from '@/workers/pdf.worker';
import type { SvgOptimizerWorkerApi } from '@/workers/svg-optimizer.worker';

import { createWorkerHook } from './create-worker-hook';

const useBgRemovalWorker = createWorkerHook<BgRemovalWorkerApi>({
  workerKey: 'bg-removal',
  workerFactory: () =>
    new Worker(new URL('../workers/bg-removal.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'Background removal failed',
});

const useOcrWorker = createWorkerHook<OcrWorkerApi>({
  workerKey: 'ocr',
  workerFactory: () =>
    new Worker(new URL('../workers/ocr.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'OCR recognition failed',
});

const useSvgOptimizerWorker = createWorkerHook<SvgOptimizerWorkerApi>({
  workerKey: 'svg-optimizer',
  workerFactory: () =>
    new Worker(new URL('../workers/svg-optimizer.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'SVG optimization failed',
});

const useColorPaletteWorker = createWorkerHook<ColorPaletteWorkerApi>({
  workerKey: 'color-palette',
  workerFactory: () =>
    new Worker(new URL('../workers/color-palette.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'Color extraction failed',
});

const useImageMetadataWorker = createWorkerHook<ImageMetadataWorkerApi>({
  workerKey: 'image-metadata',
  workerFactory: () =>
    new Worker(new URL('../workers/image-metadata.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'Failed to strip metadata',
});

const useImageCompressWorker = createWorkerHook<ImageCompressWorkerApi>({
  workerKey: 'image-compress',
  workerFactory: () =>
    new Worker(new URL('../workers/image-compress.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'Compression failed',
});

const useAspectRatioPadWorker = createWorkerHook<AspectRatioPadWorkerApi>({
  workerKey: 'aspect-ratio-pad',
  workerFactory: () =>
    new Worker(new URL('../workers/aspect-ratio-pad.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'Padding failed',
});

const useBatchImageWorker = createWorkerHook<BatchImageWorkerApi>({
  workerKey: 'batch-image',
  workerFactory: () =>
    new Worker(new URL('../workers/batch-image.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'Batch image processing failed',
});

export const usePdfOps = createWorkerHook<PdfWorkerApi>({
  workerKey: 'pdf',
  workerFactory: () =>
    new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'PDF processing failed',
});

export const useIconGen = createWorkerHook<IconGenWorkerApi>({
  workerKey: 'icon-gen',
  workerFactory: () =>
    new Worker(new URL('../workers/icon-gen.worker.ts', import.meta.url), {
      type: 'module',
    }),
  errorFallback: 'Icon generation failed',
});

export function useBgRemoval() {
  const { run, terminate, status, progress, error, setProgress } =
    useBgRemovalWorker();

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

export function useOcr() {
  const { run, terminate, status, progress, error, setProgress } =
    useOcrWorker();

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

export function useSvgOptimizer() {
  const { error, run, status, terminate } = useSvgOptimizerWorker();

  const optimize = useCallback(
    (input: string, precision: number) =>
      run((api) => api.optimizeSvg(input, precision)),
    [run],
  );

  return { error, optimize, status, terminate };
}

export function useColorPalette() {
  const { error, run, status, terminate } = useColorPaletteWorker();

  const extractDominantColors = useCallback(
    (input: File) => run((api) => api.extractDominantColors(input)),
    [run],
  );

  return { error, extractDominantColors, status, terminate };
}

export function useImageMetadata() {
  const { error, run, status, terminate } = useImageMetadataWorker();

  const stripMetadata = useCallback(
    (input: File) => run((api) => api.stripMetadata(input)),
    [run],
  );

  return { error, status, stripMetadata, terminate };
}

export function useImageCompress() {
  const { error, run, status, terminate } = useImageCompressWorker();

  const compressImage = useCallback(
    (params: { file: File; format: CompressFormat; quality: number }) =>
      run((api) => api.compressImage(params)),
    [run],
  );

  return { compressImage, error, status, terminate };
}

export function useAspectRatioPadWorkerApi() {
  const { error, run, status, terminate } = useAspectRatioPadWorker();

  const padImage = useCallback(
    (params: {
      file: File;
      fillColor: string;
      target: { targetHeight: number; targetWidth: number };
    }) => run((api) => api.padImageToDimensions(params)),
    [run],
  );

  return { error, padImage, status, terminate };
}

interface ProcessBatchParams {
  concurrency: number;
  files: File[];
  format: OutputFormat;
  height: number;
  operation: Operation;
  quality: number;
  width: number;
}

export function useBatchImageProcessor() {
  const { error, run, status, terminate } = useBatchImageWorker();

  const processBatch = useCallback(
    async (
      params: ProcessBatchParams,
      onItemResult?: (item: BatchImageWorkerItemResult) => void,
    ) => {
      await run((api) =>
        api.processBatch(
          params,
          onItemResult ? Comlink.proxy(onItemResult) : undefined,
        ),
      );
    },
    [run],
  );

  return { error, processBatch, status, terminate };
}