/**
 * Client-side PDF utilities using pdfjs-dist
 * This file should only be imported on the client side
 */

import type * as PDFJSLib from 'pdfjs-dist';
import type { PdfImageFormat } from '@/app/lib/types';

let pdfjsLib: typeof PDFJSLib | null = null;
let initialized = false;

const initPdfJs = async () => {
  if (initialized) return pdfjsLib!;

  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be used on the client side');
  }

  pdfjsLib = await import('pdfjs-dist');

  // Configure worker - use worker from public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  initialized = true;
  return pdfjsLib;
};

export const renderPdfPreview = async (
  source: string | ArrayBuffer,
  canvas: HTMLCanvasElement,
  scale: number = 1.5
) => {
  try {
    const lib = await initPdfJs();
    let data: string | { data: ArrayBuffer };

    if (typeof source === 'string') {
      data = source;
    } else {
      // Create a copy to avoid detached ArrayBuffer errors
      data = { data: source.slice(0) };
    }

    const pdf = await lib.getDocument(data).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Could not get canvas context');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await (page.render as any)({
      canvasContext: context,
      viewport,
    }).promise;
    return { success: true, totalPages: pdf.numPages };
  } catch (error) {
    console.error('PDF preview error:', error);
    throw error;
  }
};

export const getPdfPageCount = async (data: ArrayBuffer | Blob): Promise<number> => {
  try {
    const lib = await initPdfJs();
    let buffer: ArrayBuffer;

    if (data instanceof Blob) {
      buffer = await data.arrayBuffer();
    } else {
      // Create a copy to avoid detached ArrayBuffer errors
      buffer = data.slice(0);
    }

    const pdf = await lib.getDocument({ data: buffer }).promise;
    return pdf.numPages;
  } catch (error) {
    console.error('Error getting page count:', error);
    throw error;
  }
};

export const renderPdfPage = async (
  data: ArrayBuffer | Blob,
  pageNum: number,
  canvas: HTMLCanvasElement,
  scale: number = 2
) => {
  try {
    const lib = await initPdfJs();
    let buffer: ArrayBuffer;

    if (data instanceof Blob) {
      buffer = await data.arrayBuffer();
    } else {
      // Create a copy to avoid detached ArrayBuffer errors
      buffer = data.slice(0);
    }

    const pdf = await lib.getDocument({ data: buffer }).promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Could not get canvas context');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await (page.render as any)({
      canvasContext: context,
      viewport,
    }).promise;
  } catch (error) {
    console.error('Error rendering PDF page:', error);
    throw error;
  }
};

export const pdfPageToImage = async (
  data: ArrayBuffer | Blob,
  pageNum: number,
  format: PdfImageFormat = 'png',
  quality: number = 0.92
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  await renderPdfPage(data, pageNum, canvas);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert canvas to blob'));
      },
      `image/${format}`,
      quality
    );
  });
};

export const convertPdfToImages = async (
  data: ArrayBuffer | Blob,
  format: PdfImageFormat,
  quality: number,
  totalPages?: number
): Promise<Blob[]> => {
  const pages = totalPages || (await getPdfPageCount(data));
  const blobs: Blob[] = [];
  for (let i = 1; i <= pages; i++) {
    const blob = await pdfPageToImage(data, i, format, quality);
    blobs.push(blob);
  }
  return blobs;
};
