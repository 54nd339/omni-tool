import { groupConsecutivePages } from '@/lib/pdf/common';
import { pdfToImages } from '@/lib/pdf/to-image';

export type DownloadMode = 'pdf' | 'png';

export interface PngDownloadResult {
  fileName: string;
  imagePreviews: Array<{ page: number; url: string }>;
  message: string;
  payload: Blob;
}

export interface PdfDownloadResult {
  fileName: string;
  message: string;
  payload: Blob;
}

export function buildAllPagesSet(totalPages: number): Set<number> {
  return new Set(Array.from({ length: totalPages }, (_, index) => index + 1));
}

export function getSortedPages(selectedPages: Set<number>): number[] {
  return [...selectedPages].sort((a, b) => a - b);
}

export function getPdfBaseName(fileName: string): string {
  return fileName.replace(/\.pdf$/i, '');
}

export function revokeObjectUrls(urls: string[]): void {
  urls.forEach((url) => URL.revokeObjectURL(url));
}

export async function buildPngDownloadResult(params: {
  baseName: string;
  pageNumbers: number[];
  pdfBuffer: ArrayBuffer;
  scale: number;
}): Promise<PngDownloadResult> {
  const blobs = await pdfToImages(params.pdfBuffer, {
    scale: params.scale,
    pageNumbers: params.pageNumbers,
  });

  if (blobs.length === 1) {
    const page = params.pageNumbers[0];
    return {
      fileName: `${params.baseName}-page-${page}.png`,
      imagePreviews: [{ page, url: URL.createObjectURL(blobs[0]) }],
      message: '1 page converted to PNG',
      payload: blobs[0],
    };
  }

  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  blobs.forEach((blob, index) => {
    zip.file(`${params.baseName}-page-${params.pageNumbers[index]}.png`, blob);
  });

  return {
    fileName: `${params.baseName}-images.zip`,
    imagePreviews: blobs.map((blob, index) => ({
      page: params.pageNumbers[index],
      url: URL.createObjectURL(blob),
    })),
    message: `${blobs.length} pages converted to PNG`,
    payload: await zip.generateAsync({ type: 'blob' }),
  };
}

export async function buildPdfDownloadResult(params: {
  baseName: string;
  pdfBuffer: ArrayBuffer;
  splitPdf: (pdfBuffer: ArrayBuffer, ranges: Array<{ start: number; end: number }>) => Promise<Uint8Array[]>;
  sortedPages: number[];
}): Promise<PdfDownloadResult> {
  const ranges = groupConsecutivePages(params.sortedPages.map((page) => page - 1));
  const parts = await params.splitPdf(params.pdfBuffer, ranges);

  if (parts.length === 1) {
    return {
      fileName: `${params.baseName}-pages.pdf`,
      message: 'PDF pages extracted',
      payload: new Blob([parts[0] as BlobPart], { type: 'application/pdf' }),
    };
  }

  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  parts.forEach((data, index) => {
    zip.file(`${params.baseName}-part-${index + 1}.pdf`, data);
  });

  return {
    fileName: `${params.baseName}-split.zip`,
    message: 'PDF pages extracted',
    payload: await zip.generateAsync({ type: 'blob' }),
  };
}
