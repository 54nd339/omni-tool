'use client';

import { useCallback, useRef, useState } from 'react';
import type { ProcessingStatus } from '@/types';
import { getErrorMessage } from '@/lib/utils';
import {
  resizeImage,
  convertImage,
  padImage,
  adjustQuality,
  convertMedia,
  mergeMedia,
  splitMedia,
  type ResizeOptions,
  type ConvertOptions,
  type PadOptions,
  type MediaConvertOptions,
  type MediaSplitPoint,
} from '@/lib/ffmpeg';
import type { FFmpegProgressCallback } from '@/lib/ffmpeg/loader';

/** Direct API surface matching the worker's previous interface. */
interface FFmpegDirectApi {
  resizeImage(input: Blob, options: ResizeOptions): Promise<Blob>;
  convertImage(input: Blob, options: ConvertOptions): Promise<Blob>;
  padImage(input: Blob, options: PadOptions): Promise<Blob>;
  adjustQuality(input: Blob, quality: number, format: string): Promise<Blob>;
  convertMedia(input: Blob, options: MediaConvertOptions): Promise<Blob>;
  mergeMedia(inputs: { file: Blob; name: string }[], outputFormat: string): Promise<Blob>;
  splitMedia(input: Blob, points: MediaSplitPoint[], outputFormat: string): Promise<Blob[]>;
}

export function useFFmpeg() {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const progressRef = useRef<FFmpegProgressCallback>((p) => {
    setProgress(Math.round(p.ratio * 100));
  });

  const api: FFmpegDirectApi = {
    resizeImage: (input, opts) => resizeImage(input, opts, progressRef.current),
    convertImage: (input, opts) => convertImage(input, opts, progressRef.current),
    padImage: (input, opts) => padImage(input, opts, progressRef.current),
    adjustQuality: (input, quality, format) =>
      adjustQuality(input, quality, format, progressRef.current),
    convertMedia: (input, opts) => convertMedia(input, opts, progressRef.current),
    mergeMedia: (inputs, fmt) => mergeMedia(inputs, fmt, progressRef.current),
    splitMedia: (input, pts, fmt) => splitMedia(input, pts, fmt, progressRef.current),
  };

  const run = useCallback(
    async <T>(fn: (api: FFmpegDirectApi) => Promise<T>): Promise<T> => {
      setStatus('loading');
      setProgress(0);
      setError(null);

      try {
        setStatus('processing');
        const result = await fn(api);
        setStatus('done');
        return result;
      } catch (err) {
        const msg = getErrorMessage(err, 'FFmpeg processing failed');
        setError(msg);
        setStatus('error');
        throw err;
      }
    },
    // api object is stable since its methods only close over the ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { run, status, progress, error, setProgress };
}
