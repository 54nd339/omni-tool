import { fetchFile } from '@ffmpeg/util';
import { getFFmpeg, type FFmpegProgressCallback } from './loader';

function guessExtension(input: File | Blob): string {
  if (input instanceof File && input.name) {
    const ext = input.name.split('.').pop()?.toLowerCase();
    if (ext) return ext;
  }
  const mimeToExt: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/gif': 'gif',
    'image/tiff': 'tiff',
  };
  return mimeToExt[input.type] ?? 'png';
}

export interface ResizeOptions {
  width: number;
  height: number;
  maintainAspect?: boolean;
}

export interface ConvertOptions {
  outputFormat: string;
  quality?: number;
}

export interface PadOptions {
  targetWidth: number;
  targetHeight: number;
  color: string;
}

export async function resizeImage(
  input: File | Blob,
  options: ResizeOptions,
  onProgress?: FFmpegProgressCallback,
): Promise<Blob> {
  const ff = await getFFmpeg(onProgress);
  const ext = guessExtension(input);
  const inputName = `input_img.${ext}`;
  const outputName = `output.png`;

  await ff.writeFile(inputName, await fetchFile(input));

  const scale = options.maintainAspect
    ? `scale=${options.width}:${options.height}:force_original_aspect_ratio=decrease`
    : `scale=${options.width}:${options.height}`;

  await ff.exec(['-threads', '1', '-i', inputName, '-vf', scale, '-y', outputName]);

  const data = await ff.readFile(outputName);
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  return new Blob([data as BlobPart], { type: 'image/png' });
}

export async function convertImage(
  input: File | Blob,
  options: ConvertOptions,
  onProgress?: FFmpegProgressCallback,
): Promise<Blob> {
  const ff = await getFFmpeg(onProgress);
  const ext = guessExtension(input);
  const inputName = `input_img.${ext}`;
  const outputName = `output.${options.outputFormat}`;

  await ff.writeFile(inputName, await fetchFile(input));

  const args = ['-i', inputName];

  if (options.quality !== undefined && options.outputFormat === 'jpg') {
    args.push('-q:v', String(Math.round(31 - (options.quality / 100) * 30)));
  }
  if (options.quality !== undefined && options.outputFormat === 'webp') {
    args.push('-q:v', String(options.quality));
  }

  args.push('-threads', '1', '-y', outputName);
  await ff.exec(args);

  const data = await ff.readFile(outputName);
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    bmp: 'image/bmp',
    gif: 'image/gif',
    tiff: 'image/tiff',
  };

  return new Blob([data as BlobPart], { type: mimeMap[options.outputFormat] ?? 'application/octet-stream' });
}

export async function padImage(
  input: File | Blob,
  options: PadOptions,
  onProgress?: FFmpegProgressCallback,
): Promise<Blob> {
  const ff = await getFFmpeg(onProgress);
  const ext = guessExtension(input);
  const inputName = `input_img.${ext}`;
  const outputName = 'output_pad.png';

  await ff.writeFile(inputName, await fetchFile(input));

  const color = options.color === 'transparent' ? 'transparent' : options.color.replace('#', '0x');

  const filter = [
    'format=rgba',
    `scale=${options.targetWidth}:${options.targetHeight}:force_original_aspect_ratio=decrease`,
    `pad=${options.targetWidth}:${options.targetHeight}:trunc((ow-iw)/2):trunc((oh-ih)/2):color=${color}`,
  ].join(',');

  await ff.exec(['-threads', '1', '-i', inputName, '-vf', filter, '-y', outputName]);

  const data = await ff.readFile(outputName);
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  return new Blob([data as BlobPart], { type: 'image/png' });
}

export async function adjustQuality(
  input: File | Blob,
  quality: number,
  format: string = 'jpg',
  onProgress?: FFmpegProgressCallback,
): Promise<Blob> {
  return convertImage(input, { outputFormat: format, quality }, onProgress);
}
