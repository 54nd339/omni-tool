import { IconPlatform, IconPreview, ImageDimensions, ImageSettings, TargetFormat } from '@/app/lib/types';
import { UI_CONSTANTS, PLATFORM_SIZES } from '@/app/lib/constants';
import { downloadBlob } from './file';

export const processImageCanvas = async (
  src: string,
  settings: ImageSettings,
  canvas: HTMLCanvasElement,
  outputFormat: TargetFormat = 'image/jpeg',
): Promise<{ dataUrl: string; dims: ImageDimensions }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      let width = img.width * (settings.scale / UI_CONSTANTS.IMAGE.PERCENTAGE_BASE);
      let height = img.height * (settings.scale / UI_CONSTANTS.IMAGE.PERCENTAGE_BASE);

      if (!settings.keepAspect && settings.width && settings.height) {
        width = settings.width;
        height = settings.height;
      } else if (settings.width && settings.keepAspect) {
        const ratio = settings.width / img.width;
        width = settings.width;
        height = img.height * ratio;
      } else if (settings.height && settings.keepAspect) {
        const ratio = settings.height / img.height;
        height = settings.height;
        width = img.width * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.filter = settings.grayscale ? UI_CONSTANTS.IMAGE.GRAYSCALE_FILTER : 'none';
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL(outputFormat, settings.quality);
      resolve({ dataUrl, dims: { width, height } });
    };
    img.src = src;
  });
};

export const readImageDimensions = (src: string): Promise<ImageDimensions> =>
  new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });

export const generateIconPreviews = async (sourceUrl: string, platform: IconPlatform): Promise<IconPreview[]> => {
  const sizes = PLATFORM_SIZES[platform];
  const img = new Image();
  img.src = sourceUrl;
  await img.decode();

  const results: IconPreview[] = [];
  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    ctx.clearRect(0, 0, size, size);
    const scale = Math.min(size / img.width, size / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const offsetX = (size - drawW) / 2;
    const offsetY = (size - drawH) / 2;
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    results.push({ size, dataUrl: canvas.toDataURL('image/png', 1) });
  }
  return results;
};


export const blobFromDataUrl = async (dataUrl: string, mimeType?: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return mimeType && blob.type !== mimeType ? new Blob([await blob.arrayBuffer()], { type: mimeType }) : blob;
};

export const convertDataUrlFormat = async (sourceUrl: string, format: 'png' | 'jpeg' | 'webp' = 'png'): Promise<Blob> => {
  const img = document.createElement('img');
  img.src = sourceUrl;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert image'));
      },
      `image/${format}`,
      format === 'png' ? undefined : UI_CONSTANTS.IMAGE.CONVERSION_QUALITY
    );
  });
};

export const convertAndDownloadImage = async (
  sourceUrl: string,
  originalFileName: string,
  format: 'png' | 'jpeg' | 'webp'
): Promise<void> => {
  const blob = await convertDataUrlFormat(sourceUrl, format);
  const extension = format === 'jpeg' ? 'jpg' : format;
  const baseName = originalFileName.replace(/\.[^.]+$/, '');
  const filename = `${baseName}.${extension}`;

  downloadBlob(blob, filename);
};

/**
 * Normalize image file to PNG format
 * If already PNG or JPEG, returns as-is, otherwise converts to PNG
 */
export const normalizeImageToPng = async (file: File): Promise<Blob> => {
  if (file.type === 'image/png' || file.type === 'image/jpeg') {
    return file;
  }

  const arrayBuffer = await file.arrayBuffer();
  const blobUrl = URL.createObjectURL(new Blob([arrayBuffer]));
  const img = new window.Image();

  return new Promise<Blob>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        URL.revokeObjectURL(blobUrl);
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert image to PNG'));
        URL.revokeObjectURL(blobUrl);
      }, 'image/png');
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${file.name}`));
      URL.revokeObjectURL(blobUrl);
    };
    img.src = blobUrl;
  });
};

/**
 * Load image file and extract dimensions and buffer
 */
export const loadImageFile = async (file: File, normalizedBlob: Blob): Promise<{
  file: File;
  name: string;
  buffer: ArrayBuffer;
  width: number;
  height: number;
  blob: Blob;
}> => {
  const buffer = await normalizedBlob.arrayBuffer();
  const url = URL.createObjectURL(normalizedBlob);
  const img = new window.Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve({
        file,
        name: file.name,
        buffer,
        width: img.width,
        height: img.height,
        blob: normalizedBlob,
      });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${file.name}`));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
};
