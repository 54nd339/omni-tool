export type LoadedPdf = {
  file: File;
  name: string;
  pages: number;
  buffer: ArrayBuffer;
};

export type PdfImageFormat = 'png' | 'jpeg' | 'webp';
