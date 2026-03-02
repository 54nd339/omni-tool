import * as Comlink from 'comlink';
import { generateIcons, type IconGenerationRequest } from '@/lib/image/icon-generator';

const api = {
  async generateIcons(request: IconGenerationRequest): Promise<Blob> {
    try {
      return await generateIcons(request);
    } catch (e) {
      console.error('Worker error in generateIcons:', e);
      throw e;
    }
  },
};

export type IconGenWorkerApi = typeof api;

Comlink.expose(api);
