/**
 * Shared image utilities to avoid duplication
 */

export interface ImageSettings {
  scale: number;
  quality: number;
  grayscale: boolean;
  keepAspect: boolean;
  width?: number;
  height?: number;
}

export const processImageCanvas = async (
  src: string,
  settings: ImageSettings,
  canvas: HTMLCanvasElement,
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif' = 'image/jpeg',
): Promise<{ dataUrl: string; width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      let width = img.width * (settings.scale / 100);
      let height = img.height * (settings.scale / 100);

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

      ctx.filter = settings.grayscale ? 'grayscale(100%)' : 'none';
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL(outputFormat, settings.quality);
      resolve({ dataUrl, width, height });
    };
    img.src = src;
  });
};

export const formatFileSize = (bytes: number): string => {
  return `${(bytes / 1024).toFixed(2)} KB`;
};
