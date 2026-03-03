import * as Comlink from 'comlink';

import type { ColorInfo } from '@/lib/image/color-palette';
import { rgbToHex, rgbToHsl } from '@/lib/image/color-picker';

const SIMILARITY_THRESHOLD = 55;

function euclideanDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2),
  );
}

export interface ColorPaletteWorkerApi {
  extractDominantColors: (input: File) => Promise<ColorInfo[]>;
}

const api: ColorPaletteWorkerApi = {
  async extractDominantColors(input) {
    const imageBitmap = await createImageBitmap(input);

    try {
      const maxSize = 100;
      const scale = Math.min(maxSize / imageBitmap.width, maxSize / imageBitmap.height, 1);
      const width = Math.max(1, Math.round(imageBitmap.width * scale));
      const height = Math.max(1, Math.round(imageBitmap.height * scale));

      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context not available');
      }

      context.drawImage(imageBitmap, 0, 0, width, height);
      const data = context.getImageData(0, 0, width, height).data;

      const frequencies = new Map<string, { count: number; r: number; g: number; b: number }>();

      for (let index = 0; index < data.length; index += 4) {
        const alpha = data[index + 3];
        if (alpha < 128) continue;

        const r = Math.round(data[index] / 16) * 16;
        const g = Math.round(data[index + 1] / 16) * 16;
        const b = Math.round(data[index + 2] / 16) * 16;
        const key = `${r},${g},${b}`;

        const existing = frequencies.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          frequencies.set(key, { count: 1, r, g, b });
        }
      }

      const sorted = [...frequencies.values()].sort((a, b) => b.count - a.count);
      const deduplicated: typeof sorted = [];

      for (const entry of sorted) {
        const tooSimilar = deduplicated.some(
          (color) => euclideanDistance(entry, color) < SIMILARITY_THRESHOLD,
        );

        if (!tooSimilar) {
          deduplicated.push(entry);
          if (deduplicated.length >= 8) break;
        }
      }

      return deduplicated.map(({ r, g, b }) => {
        const [h, s, l] = rgbToHsl(r, g, b);
        return {
          hex: rgbToHex(r, g, b),
          rgb: { r, g, b },
          hsl: { h, s, l },
        };
      });
    } finally {
      imageBitmap.close();
    }
  },
};

Comlink.expose(api);
