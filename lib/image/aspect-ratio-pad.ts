import { ASPECT_RATIOS } from '@/lib/constants/image-studio';
import type { AspectRatio } from '@/types/common';

export const CALC_PRESETS = [
  { label: '16:9', w: 16, h: 9, ratioId: '16:9' as const },
  { label: '4:3', w: 4, h: 3, ratioId: null },
  { label: '3:2', w: 3, h: 2, ratioId: '3:2' as const },
  { label: '1:1', w: 1, h: 1, ratioId: '1:1' as const },
  { label: '9:16', w: 9, h: 16, ratioId: '9:16' as const },
  { label: '4:5', w: 4, h: 5, ratioId: '4:5' as const },
] as const satisfies readonly { label: string; w: number; h: number; ratioId: string | null }[];

function gcd(a: number, b: number): number {
  let first = Math.abs(Math.round(a));
  let second = Math.abs(Math.round(b));

  while (second) {
    [first, second] = [second, first % second];
  }

  return first;
}

export function getCalculatedRatio(widthText: string, heightText: string): { w: number; h: number; decimal: string } | null {
  const width = parseFloat(widthText);
  const height = parseFloat(heightText);

  if (!width || !height || Number.isNaN(width) || Number.isNaN(height)) return null;

  const ratioGcd = gcd(width, height);
  return {
    w: width / ratioGcd,
    h: height / ratioGcd,
    decimal: (width / height).toFixed(4),
  };
}

export function getPresetRatioById(ratioId: string | null) {
  if (!ratioId) return null;
  return ASPECT_RATIOS.find((ratio) => ratio.id === ratioId) ?? null;
}

export function computePadDimensions(
  imgWidth: number,
  imgHeight: number,
  ratio: AspectRatio,
): { targetWidth: number; targetHeight: number } {
  const rw = ratio.width;
  const rh = ratio.height;

  const imgAspect = imgWidth / imgHeight;
  const targetAspect = rw / rh;

  let targetWidth: number;
  let targetHeight: number;

  if (imgAspect > targetAspect) {
    targetWidth = imgWidth;
    targetHeight = Math.round(imgWidth / targetAspect);
  } else {
    targetHeight = imgHeight;
    targetWidth = Math.round(imgHeight * targetAspect);
  }

  return { targetWidth, targetHeight };
}
