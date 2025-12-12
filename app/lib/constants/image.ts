import { IconPlatform, TargetFormat, RatioOption } from '@/app/lib/types';

// Platform sizes for icon generation
export const PLATFORM_SIZES: Record<IconPlatform, number[]> = {
  favicon: [16, 32, 48, 64, 72, 96, 128, 192, 256, 384, 512],
  'android-icon': [36, 48, 72, 96, 144, 192],
  'apple-icon': [57, 60, 72, 76, 114, 120, 144, 152, 167, 180],
  'ms-icon': [70, 144, 150, 310],
};

// Image format options
export const IMAGE_FORMAT_OPTIONS: Array<{ value: TargetFormat; label: string }> = [
  { value: 'image/png', label: 'PNG (lossless)' },
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/webp', label: 'WebP' },
  { value: 'image/avif', label: 'AVIF' },
] as const;

// Background remover download formats
export type BackgroundRemoverFormat = 'png' | 'webp' | 'jpeg';

export const BACKGROUND_REMOVER_FORMATS: Array<{ value: BackgroundRemoverFormat; label: string }> = [
  { value: 'png', label: 'PNG (supports transparency)' },
  { value: 'webp', label: 'WebP' },
  { value: 'jpeg', label: 'JPEG' },
] as const;

// Image edit defaults
export const IMAGE_DEFAULTS = {
  EDIT_FORMAT: 'image/png' as TargetFormat,
  EDIT_QUALITY: 0.8,
  BACKGROUND_REMOVER_FORMAT: 'png' as BackgroundRemoverFormat,
} as const;

// Aspect ratio presets
export const ASPECT_RATIO_PRESETS: RatioOption[] = [
  { id: '1:1', label: 'Square 1:1', width: 1, height: 1, hint: 'Avatars, thumbnails' },
  { id: '4:5', label: 'Portrait 4:5', width: 4, height: 5, hint: 'Portrait prints' },
  { id: '3:2', label: 'Classic 3:2', width: 3, height: 2, hint: 'DSLR photos' },
  { id: '16:9', label: 'Widescreen 16:9', width: 16, height: 9, hint: 'Slides, video' },
  { id: '9:16', label: 'Vertical 9:16', width: 9, height: 16, hint: 'Stories, shorts' },
  { id: 'A4', label: 'A4 210x297', width: 210, height: 297, hint: 'Print friendly' },
  { id: '3:4', label: 'Tablet 3:4', width: 3, height: 4, hint: 'Tablets, e-readers' },
  { id: 'custom', label: 'Custom', width: 1, height: 1, hint: 'Pick your own ratio' },
];

export const BACKGROUND_FILL_OPTIONS = [
  { id: 'white', label: 'White' },
  { id: 'transparent', label: 'Transparent' },
  { id: 'custom', label: 'Custom' },
] as const;

export const OUTPUT_FORMAT_OPTIONS = [
  { value: 'png', label: 'PNG (lossless, supports transparency)' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
] as const;

export const ASPECT_RATIO_DEFAULTS = {
  ratioId: '16:9',
  customRatio: { width: 1, height: 1 },
  longEdge: 1600,
  backgroundMode: 'white' as const,
  customColor: '#ffffff',
  customOpacity: 1,
  allowUpscale: false,
  outputFormat: 'png' as const,
};

export const CANVAS_CONSTRAINTS = {
  minLongEdge: 512,
  maxLongEdge: 4096,
  step: 32,
};
