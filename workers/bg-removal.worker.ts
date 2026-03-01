import * as Comlink from 'comlink';
import { removeBg } from '@/lib/image/background-removal';

const api = {
  async removeBackground(
    input: Blob,
    onProgress?: (progress: number) => void,
  ): Promise<Blob> {
    return removeBg(input, { onProgress });
  },
};

export type BgRemovalWorkerApi = typeof api;

Comlink.expose(api);
