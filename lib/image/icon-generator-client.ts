import * as Comlink from 'comlink';

import type { IconGenerationRequest } from '@/lib/image/icon-generator';
import type { IconPlatform } from '@/types/common';

export interface SelectedPlatformPayload {
  platform: string;
  sizes: number[];
}

export function getInitialSelectedPlatforms(
  platforms: ReadonlyArray<Pick<IconPlatform, 'platform'> & { sizes: ReadonlyArray<number> }>,
): Record<string, number[]> {
  return Object.fromEntries(platforms.map((platform) => [platform.platform, [...platform.sizes]]));
}

export function getSelectedPlatformPayload(
  selectedPlatforms: Record<string, number[]>,
): SelectedPlatformPayload[] {
  return Object.entries(selectedPlatforms)
    .filter(([, sizes]) => sizes.length > 0)
    .map(([platform, sizes]) => ({ platform, sizes }));
}

export async function createIconSourceBitmap(file: File): Promise<ImageBitmap> {
  const url = URL.createObjectURL(file);

  try {
    const img = new Image();
    img.src = url;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not read source image'));
    });

    const size = Math.max(img.width, img.height, 1024);
    const canvas = new OffscreenCanvas(size, size);
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }

    const scale = Math.min(size / img.width, size / img.height);
    const width = img.width * scale;
    const height = img.height * scale;
    const x = (size - width) / 2;
    const y = (size - height) / 2;
    context.drawImage(img, x, y, width, height);

    return canvas.transferToImageBitmap();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function revokeUrl(url: string | null): void {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

export function toTransferredIconGenerationRequest(
  request: IconGenerationRequest,
): IconGenerationRequest {
  return Comlink.transfer(request, [request.sourceImageBitmap]);
}
