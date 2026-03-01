import type { AspectRatio } from '@/types';

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
