import * as Comlink from 'comlink';
import { createWorker, type Worker as TessWorker } from 'tesseract.js';

let worker: TessWorker | null = null;

const api = {
  async recognize(
    imageBlob: Blob,
    lang: string,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    if (!worker) {
      worker = await createWorker(lang, undefined, {
        logger: (info) => {
          if (info.status === 'recognizing text' && onProgress) {
            onProgress(info.progress);
          }
        },
      });
    } else {
      await worker.reinitialize(lang);
    }
    const { data } = await worker.recognize(imageBlob);
    return data.text;
  },

  async terminate() {
    if (worker) {
      await worker.terminate();
      worker = null;
    }
  },
};

export type OcrWorkerApi = typeof api;

Comlink.expose(api);
