import { hexToRgb } from '@/lib/image/color-picker';

export type BackgroundMode = 'solid' | 'linear' | 'radial';
export type PlaceholderFormat = 'png' | 'svg' | 'webp';

export interface PlaceholderPreset {
  h: number;
  w: number;
}

export interface PlaceholderFormatOption {
  id: PlaceholderFormat;
  label: string;
}

export interface PlaceholderRenderConfig {
  bgMode: BackgroundMode;
  fontSize: number;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  height: number;
  solidColor: string;
  textColor: string;
  textOverlay: boolean;
  width: number;
}

export const IMAGE_PLACEHOLDER_PRESETS: readonly PlaceholderPreset[] = [
  { h: 1080, w: 1920 },
  { h: 720, w: 1280 },
  { h: 600, w: 800 },
  { h: 300, w: 400 },
  { h: 256, w: 256 },
  { h: 128, w: 128 },
] as const;

export const IMAGE_PLACEHOLDER_FORMATS: readonly PlaceholderFormatOption[] = [
  { id: 'png', label: 'PNG' },
  { id: 'svg', label: 'SVG' },
  { id: 'webp', label: 'WebP' },
] as const;

function hexToRgba(hex: string): string {
  const [red, green, blue] = hexToRgb(hex);

  return `rgba(${red},${green},${blue},1)`;
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function clampDimension(value: number): number {
  return Math.max(1, Math.min(4096, value || 1));
}

export function resolveOverlayText(template: string, width: number, height: number): string {
  return template
    .replace(/\{width\}/gi, String(width))
    .replace(/\{height\}/gi, String(height));
}

export function drawPlaceholderCanvas(
  canvas: HTMLCanvasElement,
  config: PlaceholderRenderConfig,
  resolvedText: string,
): void {
  const {
    bgMode,
    fontSize,
    gradientAngle,
    gradientColor1,
    gradientColor2,
    height,
    solidColor,
    textColor,
    textOverlay,
    width,
  } = config;

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  if (bgMode === 'solid') {
    context.fillStyle = hexToRgba(solidColor);
    context.fillRect(0, 0, width, height);
  } else if (bgMode === 'linear') {
    const radians = (gradientAngle * Math.PI) / 180;
    const deltaX = Math.cos(radians) * width;
    const deltaY = Math.sin(radians) * height;
    const gradient = context.createLinearGradient(0, 0, deltaX, deltaY);
    gradient.addColorStop(0, hexToRgba(gradientColor1));
    gradient.addColorStop(1, hexToRgba(gradientColor2));
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  } else {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(width, height) / 2;
    const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, hexToRgba(gradientColor1));
    gradient.addColorStop(1, hexToRgba(gradientColor2));
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }

  if (textOverlay && resolvedText) {
    context.fillStyle = hexToRgba(textColor);
    context.font = `600 ${fontSize}px system-ui, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(resolvedText, width / 2, height / 2);
  }
}

export function buildPlaceholderSvg(config: PlaceholderRenderConfig, resolvedText: string): string {
  const {
    bgMode,
    fontSize,
    gradientAngle,
    gradientColor1,
    gradientColor2,
    height,
    solidColor,
    textColor,
    textOverlay,
    width,
  } = config;

  let background = '';

  if (bgMode === 'solid') {
    background = `<rect width="${width}" height="${height}" fill="${solidColor}"/>`;
  } else if (bgMode === 'linear') {
    const radians = (gradientAngle * Math.PI) / 180;
    const x1 = 0.5 - 0.5 * Math.cos(radians);
    const y1 = 0.5 - 0.5 * Math.sin(radians);
    const x2 = 0.5 + 0.5 * Math.cos(radians);
    const y2 = 0.5 + 0.5 * Math.sin(radians);

    background = `<defs><linearGradient id="g" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0%" stop-color="${gradientColor1}"/><stop offset="100%" stop-color="${gradientColor2}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/>`;
  } else {
    background = `<defs><radialGradient id="g" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="${gradientColor1}"/><stop offset="100%" stop-color="${gradientColor2}"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/>`;
  }

  const textElement =
    textOverlay && resolvedText
      ? `<text x="${width / 2}" y="${height / 2}" fill="${textColor}" font-size="${fontSize}" font-weight="600" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif">${escapeSvgText(resolvedText)}</text>`
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${background}${textElement}</svg>`;
}
