import { hslToRgb, rgbToHex, rgbToHsl } from '@/lib/image/color-picker';

export type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'split' | 'tetradic';
export type ExportFormat = 'json' | 'css' | 'tailwind' | 'scss';

export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

const SIMILARITY_THRESHOLD = 55;

function hslToHex(h: number, s: number, l: number): string {
  const [red, green, blue] = hslToRgb(h, s, l);
  return rgbToHex(red, green, blue);
}

function euclideanDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2),
  );
}

export function generateHarmony(baseHex: string, harmony: HarmonyType): string[] {
  const normalizedHex = baseHex.startsWith('#') ? baseHex : `#${baseHex}`;
  const red = parseInt(normalizedHex.slice(1, 3), 16);
  const green = parseInt(normalizedHex.slice(3, 5), 16);
  const blue = parseInt(normalizedHex.slice(5, 7), 16);
  const [h, s, l] = rgbToHsl(red, green, blue);

  switch (harmony) {
    case 'complementary':
      return [normalizedHex, hslToHex((h + 180) % 360, s, l)];
    case 'analogous':
      return [
        hslToHex((h + 330) % 360, s, l),
        normalizedHex,
        hslToHex((h + 30) % 360, s, l),
      ];
    case 'triadic':
      return [
        normalizedHex,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
      ];
    case 'split':
      return [
        normalizedHex,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
      ];
    case 'tetradic':
      return [
        normalizedHex,
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
      ];
    default:
      return [normalizedHex];
  }
}

export function formatPaletteExport(colors: ColorInfo[], format: ExportFormat): string {
  const hexes = colors.map((color) => color.hex);

  switch (format) {
    case 'json':
      return JSON.stringify(hexes, null, 2);
    case 'css':
      return hexes.map((hex, index) => `--color-${index + 1}: ${hex};`).join('\n');
    case 'tailwind':
      return `colors: {\n  palette: {\n${hexes
        .map((hex, index) => `    ${index + 1}: '${hex}',`)
        .join('\n')}\n  }\n}`;
    case 'scss':
      return hexes.map((hex, index) => `$color-${index + 1}: ${hex};`).join('\n');
    default:
      return '';
  }
}

export function extractDominantColors(imageUrl: string): Promise<ColorInfo[]> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      try {
        const maxSize = 100;
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Canvas context not available'));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
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
          if (existing) existing.count += 1;
          else frequencies.set(key, { count: 1, r, g, b });
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

        const colors: ColorInfo[] = deduplicated.map(({ r, g, b }) => {
          const [h, s, l] = rgbToHsl(r, g, b);
          return {
            hex: rgbToHex(r, g, b),
            rgb: { r, g, b },
            hsl: { h, s, l },
          };
        });

        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = imageUrl;
  });
}
