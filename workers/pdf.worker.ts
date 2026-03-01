import * as Comlink from 'comlink';
import { mergePdfs } from '@/lib/pdf/merge';
import { splitPdf, getPdfPageCount, type SplitRange } from '@/lib/pdf/split';
import { createPdfFromImages } from '@/lib/pdf/from-images';

const api = {
  async mergePdfs(buffers: ArrayBuffer[]): Promise<Uint8Array> {
    return mergePdfs(buffers);
  },

  async splitPdf(
    buffer: ArrayBuffer,
    ranges: SplitRange[],
  ): Promise<Uint8Array[]> {
    return splitPdf(buffer, ranges);
  },

  async getPdfPageCount(buffer: ArrayBuffer): Promise<number> {
    return getPdfPageCount(buffer);
  },

  async createPdfFromImages(
    images: { blob: Blob; name: string }[],
  ): Promise<Uint8Array> {
    return createPdfFromImages(images);
  },
};

export type PdfWorkerApi = typeof api;

Comlink.expose(api);
