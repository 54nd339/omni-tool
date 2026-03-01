import { removeBackground, type Config } from '@imgly/background-removal';

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
