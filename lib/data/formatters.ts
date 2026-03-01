import yaml from 'js-yaml';
import type { DataFormat } from '@/types';

export function detectFormat(input: string): DataFormat | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  if (trimmed.startsWith('<')) return 'xml';
  const firstLine = trimmed.split('\n')[0];
  if (firstLine.includes(',') && !firstLine.includes(':')) return 'csv';
  return 'yaml';
}

export function formatJson(input: string): string {
  return JSON.stringify(JSON.parse(input), null, 2);
}

export function formatYaml(input: string): string {
  const parsed = yaml.load(input);
  return yaml.dump(parsed, { indent: 2, lineWidth: 120 });
}

export function formatXml(input: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) throw new Error(errorNode.textContent ?? 'Invalid XML');

  const serializer = new XMLSerializer();
  const raw = serializer.serializeToString(doc);

  let formatted = '';
  let indent = 0;
  const lines = raw.replace(/>\s*</g, '><').split(/(<[^>]+>)/);

  for (const part of lines) {
    if (!part.trim()) continue;
    if (part.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += '  '.repeat(indent) + part + '\n';
    } else if (part.startsWith('<') && !part.startsWith('<?') && !part.endsWith('/>')) {
      formatted += '  '.repeat(indent) + part + '\n';
      if (!part.includes('</')) indent += 1;
    } else {
      formatted += '  '.repeat(indent) + part + '\n';
    }
  }
  return formatted.trim();
}

export function parseCsv(
  text: string,
  delimiter: string,
  hasHeaders: boolean,
): Record<string, string>[] | string[][] {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return [];

  const parseRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (inQuotes) {
        if (char === '"' && row[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  if (hasHeaders) {
    const headers = parseRow(lines[0]);
    return lines.slice(1).map((line) => {
      const values = parseRow(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] ?? '';
      });
      return obj;
    });
  }
  return lines.map(parseRow);
}

export function jsonToCsv(data: unknown[], delimiter: string): string {
  if (data.length === 0) return '';
  const first = data[0];
  if (typeof first !== 'object' || first === null) {
    return data.map(String).join('\n');
  }

  const headers = Object.keys(first as Record<string, unknown>);
  const escapeField = (val: unknown): string => {
    const s = String(val ?? '');
    return s.includes(delimiter) || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = [headers.map(escapeField).join(delimiter)];
  for (const item of data) {
    const obj = item as Record<string, unknown>;
    rows.push(headers.map((h) => escapeField(obj[h])).join(delimiter));
  }
  return rows.join('\n');
}

export function convertFormat(input: string, from: DataFormat, to: DataFormat): string {
  let data: unknown;

  if (from === 'json') data = JSON.parse(input);
  else if (from === 'yaml') data = yaml.load(input);
  else if (from === 'csv') data = parseCsv(input, ',', true);
  else throw new Error('XML to other conversions not supported yet');

  if (to === 'json') return JSON.stringify(data, null, 2);
  if (to === 'yaml') return yaml.dump(data, { indent: 2 });
  if (to === 'csv') {
    if (!Array.isArray(data)) throw new Error('Data must be an array for CSV');
    return jsonToCsv(data, ',');
  }
  throw new Error('Conversion to XML not supported yet');
}
