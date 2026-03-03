const FALLBACK_LENGTH = 16;
const MAX_LENGTH = 128;
const MIN_LENGTH = 4;

export function parseBooleanParam(value: string, defaultValue: boolean): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

export function parseNumberParam(value: string, min: number, max: number, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

export function parsePasswordLengthParam(value: string): number {
  return parseNumberParam(value, MIN_LENGTH, MAX_LENGTH, FALLBACK_LENGTH);
}
