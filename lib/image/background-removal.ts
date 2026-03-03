import { type Config,removeBackground } from '@imgly/background-removal';

import type { DownloadOption } from '@/types/common';

export const BG_REMOVAL_DOWNLOAD_OPTIONS = [
  { id: 'png', label: 'PNG (lossless)', extension: 'png', mimeType: 'image/png' },
  { id: 'webp', label: 'WebP (smaller)', extension: 'webp', mimeType: 'image/webp' },
] as const satisfies readonly DownloadOption[];

export interface BgRemovalOptions {
  onProgress?: (progress: number) => void;
}

export async function removeBg(
  input: File | Blob,
  options?: BgRemovalOptions,
): Promise<Blob> {
  const config: Config = {
    output: { format: 'image/png', quality: 1 },
    progress: options?.onProgress
      ? (key: string, current: number, total: number) => {
          if (total > 0) options.onProgress?.(current / total);
        }
      : undefined,
  };

  const result = await removeBackground(input, config);
  return result;
}
