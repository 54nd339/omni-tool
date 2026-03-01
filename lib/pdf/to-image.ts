import * as pdfjsLib from 'pdfjs-dist';

// Assign the worker source appropriately
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs';

export interface PdfToImageOptions {
  scale?: number;
  pageNumbers?: number[];
}

export async function pdfToImages(
  pdfBuffer: ArrayBuffer,
  options?: PdfToImageOptions,
): Promise<Blob[]> {
  const scale = options?.scale ?? 2;

  // We must BOTH copy the buffer (slice(0)) to prevent it from being detached by the worker,
  // AND wrap it in a Uint8Array to force PDF.js to read it entirely instead of as a progressive chunk.
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer.slice(0)),
  }).promise;

  const totalPages = pdf.numPages;
  const pageNumbers =
    options?.pageNumbers ?? Array.from({ length: totalPages }, (_, i) => i + 1);

  const results: Blob[] = [];

  for (const pageNum of pageNumbers) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error(`Failed to get 2D context for page ${pageNum}`);

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas conversion failed'));
      }, 'image/png');
    });

    results.push(blob);
  }

  // Explicitly destroy the pdf document to clean up worker memory
  await pdf.destroy();

  return results;
}