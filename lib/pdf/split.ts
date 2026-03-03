import { PDFDocument } from 'pdf-lib';

export interface SplitRange {
  start: number;
  end: number;
}

export async function splitPdf(
  pdfBuffer: ArrayBuffer,
  ranges: SplitRange[],
): Promise<Uint8Array[]> {
  const source = await PDFDocument.load(pdfBuffer);
  const results: Uint8Array[] = [];

  for (const range of ranges) {
    const doc = await PDFDocument.create();
    const indices = Array.from(
      { length: range.end - range.start + 1 },
      (_, i) => range.start + i,
    );
    const pages = await doc.copyPages(source, indices);
    pages.forEach((page) => doc.addPage(page));
    results.push(await doc.save());
  }

  return results;
}

export async function getPdfPageCount(pdfBuffer: ArrayBuffer): Promise<number> {
  const doc = await PDFDocument.load(pdfBuffer);
  return doc.getPageCount();
}
