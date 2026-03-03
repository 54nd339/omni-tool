import type { AspectRatio, IconPlatform, PadColor } from '@/types/common';
import type { ExifData } from '@/types/image-metadata';

export const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square 1:1', width: 1, height: 1, hint: 'Avatars, thumbnails' },
  { id: '4:5', label: 'Portrait 4:5', width: 4, height: 5, hint: 'Portrait prints' },
  { id: '3:2', label: 'Classic 3:2', width: 3, height: 2, hint: 'DSLR photos' },
  { id: '16:9', label: 'Widescreen 16:9', width: 16, height: 9, hint: 'Slides, video' },
  { id: '9:16', label: 'Vertical 9:16', width: 9, height: 16, hint: 'Stories, shorts' },
  { id: 'A4', label: 'A4 210×297', width: 210, height: 297, hint: 'Print friendly' },
  { id: '3:4', label: 'Tablet 3:4', width: 3, height: 4, hint: 'Tablets, e-readers' },
  { id: 'custom', label: 'Custom', width: 1, height: 1, hint: 'Pick your own ratio' },
] as const satisfies readonly AspectRatio[];

export const ICON_PLATFORMS = [
  { platform: 'favicon', sizes: [16, 32, 48, 64, 72, 96, 128, 192, 256, 384, 512] },
  { platform: 'android-icon', sizes: [36, 48, 72, 96, 144, 192] },
  { platform: 'apple-icon', sizes: [57, 60, 72, 76, 114, 120, 144, 152, 167, 180] },
  { platform: 'ms-icon', sizes: [70, 144, 150, 310] },
] as const satisfies readonly IconPlatform[];

export const PAD_COLORS = [
  { id: 'white', label: 'White', value: '#ffffff' },
  { id: 'transparent', label: 'Transparent', value: 'transparent' },
  { id: 'custom', label: 'Custom' },
] as const satisfies readonly PadColor[];

export const OCR_LANGUAGES = [
  { id: 'eng', label: 'English' },
  { id: 'spa', label: 'Spanish' },
  { id: 'fra', label: 'French' },
  { id: 'deu', label: 'German' },
  { id: 'por', label: 'Portuguese' },
  { id: 'ita', label: 'Italian' },
  { id: 'chi_sim', label: 'Chinese (Simplified)' },
  { id: 'jpn', label: 'Japanese' },
  { id: 'kor', label: 'Korean' },
  { id: 'hin', label: 'Hindi' },
  { id: 'ara', label: 'Arabic' },
  { id: 'rus', label: 'Russian' },
] as const;

export const IMAGE_EDITOR_FORMAT_OPTIONS = [
  { id: 'png', label: 'PNG' },
  { id: 'jpg', label: 'JPG' },
  { id: 'webp', label: 'WebP' },
  { id: 'bmp', label: 'BMP' },
  { id: 'gif', label: 'GIF' },
] as const;

export const THEME_COLORS = {
  dark: '#09090b',
  darkElevated: '#18181b',
  darkMuted: '#27272a',
  light: '#fafafa',
  mutedText: '#a1a1aa',
} as const;

export const EXIF_TAGS: Record<number, keyof ExifData> = {
  0x010f: 'Make',
  0x0110: 'Model',
  0x0132: 'DateTime',
  0x829a: 'ExposureTime',
  0x829d: 'FNumber',
  0x8827: 'ISO',
  0x920a: 'FocalLength',
  0xa002: 'ImageWidth',
  0xa003: 'ImageHeight',
  0x0112: 'Orientation',
  0x0131: 'Software',
} as const satisfies Record<number, keyof ExifData>;

export const TIFF_TAGS: Record<number, keyof ExifData> = {
  0x0100: 'ImageWidth',
  0x0101: 'ImageHeight',
  0x0132: 'DateTime',
  0x010f: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
} as const satisfies Record<number, keyof ExifData>;

export const METADATA_TAG_LABELS: Record<keyof ExifData, string> = {
  Make: 'Make',
  Model: 'Model',
  DateTime: 'Date/Time',
  ExposureTime: 'Exposure time',
  FNumber: 'F-number',
  ISO: 'ISO',
  FocalLength: 'Focal length',
  ImageWidth: 'Image width',
  ImageHeight: 'Image height',
  Orientation: 'Orientation',
  Software: 'Software',
  GPSLatitude: 'GPS latitude',
  GPSLongitude: 'GPS longitude',
} as const satisfies Record<keyof ExifData, string>;