import type { Change } from 'diff';

import type { DiffMode } from '@/types/common';

export function detectLanguage(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return 'plaintext';
  try {
    JSON.parse(trimmed);
    return 'json';
  } catch {}

  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) return 'html';
  if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && trimmed.endsWith('>'))) return 'xml';
  if (/^---\s*\n/.test(trimmed) || /^\w+:\s/m.test(trimmed)) return 'yaml';
  if (/^(import|export|const|let|var|function)\s/.test(trimmed)) return 'javascript';
  if (/^(def |class |import |from )/.test(trimmed)) return 'python';
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s/i.test(trimmed)) return 'sql';
  if (/^package\s+\w+/.test(trimmed)) return 'go';
  if (/^(use |fn |struct |impl |pub )/.test(trimmed)) return 'rust';

  return 'plaintext';
}

export function generateUnifiedDiff(changes: Change[]): string {
  const lines: string[] = [];
  for (const part of changes) {
    const prefix = part.added ? '+' : part.removed ? '-' : ' ';
    for (const line of part.value.split('\n')) {
      if (line || prefix !== ' ') lines.push(`${prefix}${line}`);
    }
  }
  return lines.join('\n');
}

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((obj as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return obj;
}

function normalizeJson(text: string): { normalized: string; error: string | null } {
  try {
    const parsed = JSON.parse(text);
    return { normalized: JSON.stringify(sortKeys(parsed), null, 2), error: null };
  } catch (error) {
    return {
      normalized: text,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
}

export function computeDiff(
  Diff: typeof import('diff'),
  left: string,
  right: string,
  mode: DiffMode,
): { changes: Change[]; jsonError: string | null } {
  if (mode === 'json') {
    const leftNormalized = normalizeJson(left);
    const rightNormalized = normalizeJson(right);
    const error = leftNormalized.error
      ? `Left: ${leftNormalized.error}`
      : rightNormalized.error
        ? `Right: ${rightNormalized.error}`
        : null;

    return {
      changes: Diff.diffLines(leftNormalized.normalized, rightNormalized.normalized),
      jsonError: error,
    };
  }

  switch (mode) {
    case 'line':
      return { changes: Diff.diffLines(left, right), jsonError: null };
    case 'word':
      return { changes: Diff.diffWords(left, right), jsonError: null };
    case 'char':
      return { changes: Diff.diffChars(left, right), jsonError: null };
    case 'sentence':
      return { changes: Diff.diffSentences(left, right), jsonError: null };
  }
}

export function getDiffStats(changes: Change[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;

  for (const change of changes) {
    if (change.added) added += change.count ?? 0;
    if (change.removed) removed += change.count ?? 0;
  }

  return { added, removed };
}
