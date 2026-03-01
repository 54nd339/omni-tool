import * as Comlink from 'comlink';
import { generateIcons, type IconGenerationRequest } from '@/lib/image/icon-generator';

const api = {
  async generateIcons(request: IconGenerationRequest): Promise<Blob> {
    return generateIcons(request);
  },
};

export type IconGenWorkerApi = typeof api;

Comlink.expose(api);
