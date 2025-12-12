import { RatioOption, OutputFormat } from '@/app/lib/types';

export const clampRatioValue = (value: number, fallback: number): number =>
  Number.isFinite(value) && value > 0 ? value : fallback;

export const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
        .split('')
        .map((c) => c + c)
        .join('')
      : normalized.padEnd(6, '0');
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const safeAlpha = Math.min(Math.max(alpha, 0), 1);
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
};

export const buildTargetSize = (
  ratio: RatioOption,
  longEdge: number
): { width: number; height: number } => {
  const maxSide = Math.max(ratio.width, ratio.height) || 1;
  return {
    width: Math.round((ratio.width / maxSide) * longEdge),
    height: Math.round((ratio.height / maxSide) * longEdge),
  };
};

export const calculateDataUrlSize = (dataUrl: string): number => {
  const base64Header = /^data:[^;]+;base64,/;
  const base64 = dataUrl.replace(base64Header, '');
  return Math.round((base64.length * 3) / 4);
};

export const getImageMimeType = (format: OutputFormat): string => {
  switch (format) {
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'png':
    default:
      return 'image/png';
  }
};

export const generateDownloadFilename = (originalName: string, ratioId: string, extension: string): string => {
  const safeName = originalName.replace(/\.[^.]+$/, '');
  const ratioLabel = ratioId.replace(':', 'x');
  return `${safeName}-padded-${ratioLabel}.${extension}`;
};

/**
 * Generate padded image with aspect ratio
 * This is the core business logic for aspect ratio padding
 */
export interface GeneratePaddedImageParams {
  imageUrl: string;
  canvas: HTMLCanvasElement;
  targetSize: { width: number; height: number };
  allowUpscale: boolean;
  backgroundMode: 'transparent' | 'white' | 'custom';
  customColor?: string;
  customOpacity?: number;
  outputFormat: OutputFormat;
}

export interface GeneratePaddedImageResult {
  dataUrl: string;
  mime: string;
  originalDims: { width: number; height: number };
  resultDims: { width: number; height: number };
}

export const generatePaddedImage = async (
  params: GeneratePaddedImageParams
): Promise<GeneratePaddedImageResult> => {
  const {
    imageUrl,
    canvas,
    targetSize,
    allowUpscale,
    backgroundMode,
    customColor = '#ffffff',
    customOpacity = 1,
    outputFormat,
  } = params;

  const img = new Image();
  img.src = imageUrl;
  await img.decode();

  const originalDims = { width: img.naturalWidth, height: img.naturalHeight };
  const { width: targetWidth, height: targetHeight } = targetSize;

  const scale = Math.min(
    targetWidth / img.naturalWidth,
    targetHeight / img.naturalHeight
  );
  const appliedScale = allowUpscale ? scale : Math.min(1, scale);
  const drawWidth = Math.round(img.naturalWidth * appliedScale);
  const drawHeight = Math.round(img.naturalHeight * appliedScale);
  const offsetX = Math.round((targetWidth - drawWidth) / 2);
  const offsetY = Math.round((targetHeight - drawHeight) / 2);

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to access canvas context');

  // Fill background
  if (backgroundMode === 'transparent') {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  } else {
    const fill =
      backgroundMode === 'white'
        ? 'rgba(255, 255, 255, 1)'
        : hexToRgba(customColor, customOpacity);
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw image centered
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  // Convert to selected format
  const mime = getImageMimeType(outputFormat);
  const quality = mime === 'image/png' ? undefined : 0.95;
  const dataUrl = canvas.toDataURL(mime, quality);

  return {
    dataUrl,
    mime,
    originalDims,
    resultDims: { width: targetWidth, height: targetHeight },
  };
};
