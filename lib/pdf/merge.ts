import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(
  pdfBuffers: ArrayBuffer[],
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const donor = await PDFDocument.load(buffer);
    const pages = await merged.copyPages(donor, donor.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  return merged.save();
}
