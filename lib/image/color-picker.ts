import type { ColorStop, GradientType } from '@/types/common';

export type { ColorStop, GradientType } from '@/types/common';

export function getInitialHex(pasteValue: string | null): string {
  if (!pasteValue) return '#3b82f6';
  const decoded = decodeURIComponent(pasteValue).trim();
  if (!/^#?[0-9a-f]{6}$/i.test(decoded)) return '#3b82f6';
  return decoded.startsWith('#') ? decoded.toLowerCase() : `#${decoded.toLowerCase()}`;
}

export const GRADIENT_PRESETS = [
  { name: 'Sunset', stops: [{ color: '#ff6b6b', position: 0 }, { color: '#feca57', position: 100 }] },
  { name: 'Ocean', stops: [{ color: '#0652DD', position: 0 }, { color: '#1289A7', position: 50 }, { color: '#12CBC4', position: 100 }] },
  { name: 'Aurora', stops: [{ color: '#6c5ce7', position: 0 }, { color: '#a29bfe', position: 50 }, { color: '#74b9ff', position: 100 }] },
  { name: 'Flame', stops: [{ color: '#e74c3c', position: 0 }, { color: '#f39c12', position: 50 }, { color: '#f1c40f', position: 100 }] },
  { name: 'Forest', stops: [{ color: '#2d3436', position: 0 }, { color: '#00b894', position: 100 }] },
  { name: 'Candy', stops: [{ color: '#fc5c7d', position: 0 }, { color: '#6a82fb', position: 100 }] },
] as const satisfies readonly { name: string; stops: readonly Omit<ColorStop, 'id'>[] }[];

export function createColorStopId(): string {
  return `stop-${crypto.randomUUID()}`;
}

export function createDefaultStops(): ColorStop[] {
  return [
    { id: createColorStopId(), color: '#6366f1', position: 0 },
    { id: createColorStopId(), color: '#ec4899', position: 100 },
  ];
}

export function buildGradientCss(type: GradientType, angle: number, stops: ColorStop[]): string {
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const colorList = sortedStops.map((stop) => `${stop.color} ${stop.position}%`).join(', ');

  if (type === 'linear') return `linear-gradient(${angle}deg, ${colorList})`;
  if (type === 'radial') return `radial-gradient(circle, ${colorList})`;
  return `conic-gradient(from ${angle}deg, ${colorList})`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) return [0, 0, Math.round(lightness * 100)];

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;
  if (max === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6;
  else if (max === green) hue = ((blue - red) / delta + 2) / 6;
  else hue = ((red - green) / delta + 4) / 6;

  return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(lightness * 100)];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  if (saturation === 0) {
    const value = Math.round(lightness * 255);
    return [value, value, value];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };

  const q = lightness < 0.5
    ? lightness * (1 + saturation)
    : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return [
    Math.round(hue2rgb(p, q, hue + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, hue) * 255),
    Math.round(hue2rgb(p, q, hue - 1 / 3) * 255),
  ];
}

function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(...hslToRgb(h, s, l));
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(
  rgbOne: [number, number, number],
  rgbTwo: [number, number, number],
): number {
  const lumOne = relativeLuminance(...rgbOne);
  const lumTwo = relativeLuminance(...rgbTwo);
  const lighter = Math.max(lumOne, lumTwo);
  const darker = Math.min(lumOne, lumTwo);
  return (lighter + 0.05) / (darker + 0.05);
}

export function generateShades(hex: string): string[] {
  const [h, s] = rgbToHsl(...hexToRgb(hex));
  return [95, 85, 70, 55, 45, 35, 25, 15, 8].map((lightness) => hslToHex(h, s, lightness));
}
