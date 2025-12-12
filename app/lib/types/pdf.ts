export type LoadedPdf = {
  file: File;
  name: string;
  pages: number;
  buffer: ArrayBuffer;
};

export interface ImageFile {
  file: File;
  name: string;
  buffer: ArrayBuffer;
  width: number;
  height: number;
  blob: Blob;
}

export type PdfImageFormat = 'png' | 'jpeg' | 'webp';
