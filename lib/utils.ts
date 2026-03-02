import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), SIZE_UNITS.length - 1);
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(decimals)} ${SIZE_UNITS[i]}`;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function reorderByIds<T>(
  items: T[],
  orderedIds: string[],
  getId: (item: T) => string,
): T[] {
  const map = new Map(items.map((item) => [getId(item), item]));
  return orderedIds.map((id) => map.get(id)).filter((item): item is T => item !== undefined);
}
