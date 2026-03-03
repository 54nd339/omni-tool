import * as Comlink from 'comlink';

import type { CompressFormat } from '@/lib/image/image-editor';

function getCompressMimeType(format: CompressFormat): string {
  if (format === 'jpeg') return 'image/jpeg';
  if (format === 'webp') return 'image/webp';
  return 'image/png';
}

function getCompressQualityValue(
  format: CompressFormat,
  quality: number,
): number | undefined {
  return format === 'png' ? undefined : quality / 100;
}

export interface ImageCompressWorkerApi {
  compressImage: (params: {
    file: File;
    format: CompressFormat;
    quality: number;
  }) => Promise<Blob>;
}

const api: ImageCompressWorkerApi = {
  async compressImage(params) {
    const image = await createImageBitmap(params.file);

    try {
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      context.drawImage(image, 0, 0);

      return canvas.convertToBlob({
        quality: getCompressQualityValue(params.format, params.quality),
        type: getCompressMimeType(params.format),
      });
    } finally {
      image.close();
    }
  },
};

Comlink.expose(api);
