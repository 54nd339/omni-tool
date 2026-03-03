import { createId } from '@/lib/utils';
import { type HeaderRow } from '@/types/dev-utils';

export type ApiMode = 'rest' | 'graphql' | 'websocket';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface ResponseState {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timeMs: number;
  sizeBytes: number;
  ok: boolean;
  isJson: boolean;
}

export interface RequestHistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  statusText: string;
  timeMs: number;
  responseBody: string;
  isJson: boolean;
}

export const MAX_HISTORY = 10;
export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const satisfies readonly HttpMethod[];

export function createApiId(): string {
  return createId();
}

export function parseResponseHeaders(headers: Headers): Record<string, string> {
  const values: Record<string, string> = {};
  headers.forEach((value, key) => {
    values[key] = value;
  });
  return values;
}

export function tryFormatJson(value: string): string {
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}

export function buildHeaderObject(headers: HeaderRow[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const header of headers) {
    const key = header.key.trim();
    if (key) {
      result[key] = header.value.trim();
    }
  }
  return result;
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
  if (status >= 400 && status < 500) return 'text-amber-600 dark:text-amber-400';
  if (status >= 500) return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
}
