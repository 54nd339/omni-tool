import { type ClassValue, clsx } from 'clsx';
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

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function downloadJson(content: string, filename: string): void {
  downloadBlob(new Blob([content], { type: 'application/json' }), filename);
}

export async function readFileText(
  file: File,
  errorMessage = 'Failed to read file',
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) ?? '');
    reader.onerror = () => reject(new Error(errorMessage));
    reader.readAsText(file);
  });
}

export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function createId(length = 9): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replaceAll('-', '').slice(0, length);
  }

  return Math.random().toString(36).slice(2, 2 + length);
}

export function createPrefixedId(prefix: string, length = 6): string {
  return `${prefix}-${Date.now()}-${createId(length)}`;
}

export function reorderByIds<T>(
  items: T[],
  orderedIds: string[],
  getId: (item: T) => string,
): T[] {
  const map = new Map(items.map((item) => [getId(item), item]));
  return orderedIds.map((id) => map.get(id)).filter((item): item is T => item !== undefined);
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

export function clearAllAppData(): void {
  localStorage.clear();
}

export function reloadPage(): void {
  window.location.reload();
}
