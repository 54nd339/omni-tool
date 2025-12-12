import { PdfImageFormat } from '@/app/lib/types';

export const PDF_IMAGE_FORMAT_OPTIONS: Array<{ value: PdfImageFormat; label: string }> = [
  { value: 'png', label: 'PNG (lossless)' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
] as const;

export const DOCS_DEFAULTS = {
  PDF_IMAGE_FORMAT: 'png' as PdfImageFormat,
  PDF_QUALITY: 0.92,
} as const;
