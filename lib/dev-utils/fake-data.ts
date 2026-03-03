import {
  ADDRESS_SUFFIXES,
  CITIES,
  COMPANIES,
  COUNTRIES,
  DEFAULT_FIELDS,
  EMAIL_DOMAINS,
  FIELD_TYPES,
  FIRST_NAMES,
  JOB_TITLES,
  LAST_NAMES,
  URL_TLDS,
  WORDS,
} from '@/lib/constants/dev-utils';
import type { FieldSchema, FieldType } from '@/types/dev-utils';

export { DEFAULT_FIELDS, FIELD_TYPES };
export type { FieldSchema, FieldType };

export function createRandomFieldId(): string {
  return crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  const minValue = Math.ceil(min);
  const maxValue = Math.floor(max);
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function generateFieldValue(type: FieldType, min?: number, max?: number): string | number | boolean {
  switch (type) {
    case 'First Name':
      return pickRandom(FIRST_NAMES);
    case 'Last Name':
      return pickRandom(LAST_NAMES);
    case 'Full Name':
      return `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`;
    case 'Email': {
      const first = pickRandom(FIRST_NAMES).toLowerCase();
      const last = pickRandom(LAST_NAMES).toLowerCase();
      const separator = Math.random() > 0.5 ? '.' : '_';
      return `${first}${separator}${last}@${pickRandom(EMAIL_DOMAINS)}`;
    }
    case 'Phone':
      return `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
    case 'Address':
      return `${randomInt(1, 9999)} ${pickRandom(WORDS)} ${pickRandom(ADDRESS_SUFFIXES)}`;
    case 'City':
      return pickRandom(CITIES);
    case 'Country':
      return pickRandom(COUNTRIES);
    case 'Company':
      return pickRandom(COMPANIES);
    case 'Job Title':
      return pickRandom(JOB_TITLES);
    case 'UUID':
      return crypto.randomUUID();
    case 'Date': {
      const year = randomInt(2020, 2025);
      const month = String(randomInt(1, 12)).padStart(2, '0');
      const day = String(randomInt(1, 28)).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    case 'Boolean':
      return Math.random() > 0.5;
    case 'Integer': {
      const lo = min ?? 0;
      const hi = max ?? 100;
      return randomInt(Math.min(lo, hi), Math.max(lo, hi));
    }
    case 'Float': {
      const lo = min ?? 0;
      const hi = max ?? 100;
      return randomFloat(Math.min(lo, hi), Math.max(lo, hi));
    }
    case 'URL':
      return `https://${pickRandom(WORDS)}.${pickRandom(URL_TLDS)}/${pickRandom(WORDS)}`;
    case 'IP Address':
      return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`;
    case 'Hex Color': {
      const bytes = crypto.getRandomValues(new Uint8Array(3));
      return `#${Array.from(bytes).map((value) => value.toString(16).padStart(2, '0')).join('')}`;
    }
    case 'Sentence': {
      const length = randomInt(5, 15);
      const words = Array.from({ length }, () => pickRandom(WORDS) as string);
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      return `${words.join(' ')}.`;
    }
    case 'Paragraph': {
      const sentenceCount = randomInt(3, 6);
      const sentences: string[] = [];
      for (let index = 0; index < sentenceCount; index++) {
        const length = randomInt(5, 12);
        const words = Array.from({ length }, () => pickRandom(WORDS) as string);
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        sentences.push(`${words.join(' ')}.`);
      }
      return sentences.join(' ');
    }
    default:
      return '';
  }
}

function toCsv(rows: Record<string, string | number | boolean>[]): string {
  const headers = Object.keys(rows[0] ?? {});
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${String(value).replace(/"/g, '""')}"`;
          }
          return String(value);
        })
        .join(','),
    ),
  ];

  return lines.join('\n');
}

export function generateFakeData(
  fieldSchema: FieldSchema[],
  records: number,
  format: 'json' | 'csv',
): string {
  const count = Math.min(1000, Math.max(1, records));
  const rows: Record<string, string | number | boolean>[] = [];

  for (let index = 0; index < count; index++) {
    const row: Record<string, string | number | boolean> = {};
    let firstName = '';
    let lastName = '';

    for (const field of fieldSchema) {
      let value: string | number | boolean;

      if (field.type === 'Email' && (firstName || lastName)) {
        const first = firstName || pickRandom(FIRST_NAMES);
        const last = lastName || pickRandom(LAST_NAMES);
        const separator = Math.random() > 0.5 ? '.' : '_';
        value = `${first.toLowerCase()}${separator}${last.toLowerCase()}@${pickRandom(EMAIL_DOMAINS)}`;
      } else {
        value = generateFieldValue(field.type, field.min, field.max);
      }

      if (field.type === 'First Name') firstName = String(value);
      if (field.type === 'Last Name') lastName = String(value);
      if (field.type === 'Full Name') {
        const [first = '', last = ''] = String(value).split(' ');
        firstName = first;
        lastName = last;
      }

      row[field.name || `field_${field.id}`] = value;
    }

    rows.push(row);
  }

  return format === 'json' ? JSON.stringify(rows, null, 2) : toCsv(rows);
}
