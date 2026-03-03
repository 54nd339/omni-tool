import { downloadBlob } from '@/lib/utils';

export interface DataVizColumns {
  categorical: string[];
  numeric: string[];
}

export type DataVizRow = Record<string, unknown>;
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area';

export const DATA_VIZ_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'] as const;

function tryParseJson(text: string): DataVizRow[] | null {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function tryParseCsv(text: string): DataVizRow[] | null {
  const lines = text.trim().split('\n');
  if (lines.length < 2) {
    return null;
  }

  const separator = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(separator).map((header) => header.trim().replace(/^["']|["']$/g, ''));
  if (headers.length < 2) {
    return null;
  }

  const rows: DataVizRow[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = lines[index].split(separator).map((value) => value.trim().replace(/^["']|["']$/g, ''));
    if (values.length !== headers.length) {
      continue;
    }

    const row: DataVizRow = {};
    for (let columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
      const num = Number(values[columnIndex]);
      row[headers[columnIndex]] = Number.isNaN(num) ? values[columnIndex] : num;
    }
    rows.push(row);
  }

  return rows.length > 0 ? rows : null;
}

export function parseDataVizInput(text: string): DataVizRow[] | null {
  if (!text.trim()) {
    return null;
  }

  return tryParseJson(text) || tryParseCsv(text);
}

export function inferDataVizColumns(data: DataVizRow[]): DataVizColumns {
  const keys = Object.keys(data[0]);
  const numeric: string[] = [];
  const categorical: string[] = [];

  for (const key of keys) {
    const numericCount = data.filter((row) => typeof row[key] === 'number').length;
    if (numericCount > data.length * 0.5) {
      numeric.push(key);
    } else {
      categorical.push(key);
    }
  }

  return { numeric, categorical };
}

export function getDataVizSample(sample: 'json' | 'csv'): string {
  if (sample === 'json') {
    return JSON.stringify([
      { month: 'Jan', sales: 65, returns: 12 },
      { month: 'Feb', sales: 59, returns: 8 },
      { month: 'Mar', sales: 80, returns: 15 },
      { month: 'Apr', sales: 81, returns: 10 },
      { month: 'May', sales: 56, returns: 6 },
      { month: 'Jun', sales: 95, returns: 18 },
    ], null, 2);
  }

  return `city,population,area
Tokyo,37400000,2191
Delhi,30290000,1484
Shanghai,27058000,6341
São Paulo,22043000,1521
Mumbai,20411000,603
Cairo,20076000,3085`;
}

function getSvgString(container: HTMLDivElement): string | null {
  const svg = container.querySelector('svg');
  if (!svg) {
    return null;
  }

  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

export function exportChartAsSvg(container: HTMLDivElement): void {
  const svgString = getSvgString(container);
  if (!svgString) {
    return;
  }

  downloadBlob(new Blob([svgString], { type: 'image/svg+xml' }), 'chart.svg');
}

export async function exportChartAsPng(container: HTMLDivElement): Promise<void> {
  const svg = container.querySelector('svg');
  if (!svg) {
    return;
  }

  const svgString = getSvgString(container);
  if (!svgString) {
    return;
  }

  const rect = svg.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.scale(dpr, dpr);

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, rect.width, rect.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG'));
          return;
        }

        downloadBlob(blob, 'chart.png');
        resolve();
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Failed to render chart image'));
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
  });
}
