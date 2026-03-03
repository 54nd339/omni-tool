import { PDFDocument } from 'pdf-lib';

import type { SplitRange } from './split';

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

export function groupConsecutivePages(pages: number[]): SplitRange[] {
  if (pages.length === 0) return [];
  const sorted = [...pages].sort((a, b) => a - b);

  const ranges: SplitRange[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push({ start, end });
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push({ start, end });

  return ranges;
}