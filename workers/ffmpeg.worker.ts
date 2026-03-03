import * as Comlink from 'comlink';

import {
  adjustQuality,
  convertImage,
  type ConvertOptions,
  padImage,
  type PadOptions,
  resizeImage,
  type ResizeOptions,
} from '@/lib/ffmpeg/image-ops';
import type { FFmpegProgressCallback } from '@/lib/ffmpeg/loader';
import {
  convertMedia,
  type MediaConvertOptions,
  type MediaSplitPoint,
  mergeMedia,
  splitMedia,
} from '@/lib/ffmpeg/media-ops';

export interface FFmpegWorkerApi {
  adjustQuality: (
    input: Blob,
    quality: number,
    format: string,
    onProgress?: FFmpegProgressCallback,
  ) => Promise<Blob>;
  convertImage: (
    input: Blob,
    options: ConvertOptions,
    onProgress?: FFmpegProgressCallback,
  ) => Promise<Blob>;
  convertMedia: (
    input: Blob,
    options: MediaConvertOptions,
    onProgress?: FFmpegProgressCallback,
  ) => Promise<Blob>;
  mergeMedia: (
    inputs: { file: Blob; name: string }[],
    outputFormat: string,
    onProgress?: FFmpegProgressCallback,
  ) => Promise<Blob>;
  padImage: (
    input: Blob,
    options: PadOptions,
    onProgress?: FFmpegProgressCallback,
  ) => Promise<Blob>;
  resizeImage: (
    input: Blob,
    options: ResizeOptions,
    onProgress?: FFmpegProgressCallback,
  ) => Promise<Blob>;
  splitMedia: (
    input: Blob,
    points: MediaSplitPoint[],
    outputFormat: string,
    onProgress?: FFmpegProgressCallback,
  ) => Promise<Blob[]>;
}

const api: FFmpegWorkerApi = {
  adjustQuality: (input, quality, format, onProgress) =>
    adjustQuality(input, quality, format, onProgress),
  convertImage: (input, options, onProgress) =>
    convertImage(input, options, onProgress),
  convertMedia: (input, options, onProgress) =>
    convertMedia(input, options, onProgress),
  mergeMedia: (inputs, outputFormat, onProgress) =>
    mergeMedia(inputs, outputFormat, onProgress),
  padImage: (input, options, onProgress) => padImage(input, options, onProgress),
  resizeImage: (input, options, onProgress) =>
    resizeImage(input, options, onProgress),
  splitMedia: (input, points, outputFormat, onProgress) =>
    splitMedia(input, points, outputFormat, onProgress),
};

Comlink.expose(api);
