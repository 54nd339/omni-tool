import type { SplitRange } from './split';

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
