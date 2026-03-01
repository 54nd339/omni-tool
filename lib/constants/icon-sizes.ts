import type { IconPlatform } from '@/types';

export const ICON_PLATFORMS = [
  { platform: 'favicon', sizes: [16, 32, 48, 64, 72, 96, 128, 192, 256, 384, 512] },
  { platform: 'android-icon', sizes: [36, 48, 72, 96, 144, 192] },
  { platform: 'apple-icon', sizes: [57, 60, 72, 76, 114, 120, 144, 152, 167, 180] },
  { platform: 'ms-icon', sizes: [70, 144, 150, 310] },
] as const satisfies readonly IconPlatform[];
