import { PDFDocument } from 'pdf-lib';
import { LoadedPdf } from '@/app/lib/types';

export interface ImageFile {
  file: File;
  name: string;
  buffer: ArrayBuffer;
  width: number;
  height: number;
  blob: Blob;
}

export const loadPdf = async (file: File): Promise<LoadedPdf> => {
  const buffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(buffer);
  return {
    file,
    name: file.name,
    pages: doc.getPageCount(),
    buffer,
  };
};

export const mergePdfs = async (pdfs: LoadedPdf[]): Promise<Blob> => {
  const merged = await PDFDocument.create();
  for (const pdfFile of pdfs) {
    // Create a copy of each buffer to avoid "detached ArrayBuffer" errors
    const bufferCopy = pdfFile.buffer.slice(0);
    const src = await PDFDocument.load(bufferCopy);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  const bytes = await merged.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
};

export const splitPdfPages = async (pdf: LoadedPdf): Promise<Blob[]> => {
  // Create a copy of the buffer to avoid "detached ArrayBuffer" errors
  const bufferCopy = pdf.buffer.slice(0);
  const src = await PDFDocument.load(bufferCopy);
  const outputs: Blob[] = [];
  for (const idx of src.getPageIndices()) {
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(src, [idx]);
    out.addPage(page);
    const bytes = await out.save();
    outputs.push(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
  }
  return outputs;
};

export const createPdfFromImages = async (images: ImageFile[]): Promise<Blob> => {
  const doc = await PDFDocument.create();

  for (const img of images) {
    // Embed the image as PNG (can be any supported format)
    const imageData = new Uint8Array(img.buffer);
    const mimeType = img.blob.type || 'image/png';
    
    let embeddedImage;
    if (mimeType === 'image/png') {
      embeddedImage = await doc.embedPng(imageData);
    } else if (mimeType === 'image/jpeg') {
      embeddedImage = await doc.embedJpg(imageData);
    } else {
      // Default to PNG for other formats
      embeddedImage = await doc.embedPng(imageData);
    }

    // Create a page with the image dimensions
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: img.width,
      height: img.height,
    });
  }

  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
};
