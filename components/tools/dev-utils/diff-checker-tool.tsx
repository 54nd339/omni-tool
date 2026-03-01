'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CopyButton } from '@/components/shared/copy-button';
import { cn } from '@/lib/utils';
import type { DiffMode } from '@/types';

const DiffEditor = dynamic(() => import('@monaco-editor/react').then((m) => m.DiffEditor), { ssr: false });

type ViewMode = 'simple' | 'monaco';

const MODES: { id: DiffMode; label: string }[] = [
  { id: 'line', label: 'Lines' },
  { id: 'word', label: 'Words' },
  { id: 'char', label: 'Characters' },
  { id: 'sentence', label: 'Sentences' },
  { id: 'json', label: 'JSON' },
];

const LANGUAGES = [
  { id: 'plaintext', label: 'Plain Text' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'json', label: 'JSON' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'python', label: 'Python' },
  { id: 'sql', label: 'SQL' },
  { id: 'yaml', label: 'YAML' },
  { id: 'xml', label: 'XML' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'markdown', label: 'Markdown' },
];

function detectLanguage(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return 'plaintext';
  try { JSON.parse(trimmed); return 'json'; } catch { /* not json */ }
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

function generateUnifiedDiff(changes: import('diff').Change[]): string {
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
  } catch (e) {
    return { normalized: text, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

function computeDiff(
  Diff: typeof import('diff'),
  left: string,
  right: string,
  mode: DiffMode,
): { changes: import('diff').Change[]; jsonError: string | null } {
  if (mode === 'json') {
    const l = normalizeJson(left);
    const r = normalizeJson(right);
    const error = l.error ? `Left: ${l.error}` : r.error ? `Right: ${r.error}` : null;
    return { changes: Diff.diffLines(l.normalized, r.normalized), jsonError: error };
  }

  let changes: import('diff').Change[];
  switch (mode) {
    case 'line': changes = Diff.diffLines(left, right); break;
    case 'word': changes = Diff.diffWords(left, right); break;
    case 'char': changes = Diff.diffChars(left, right); break;
    case 'sentence': changes = Diff.diffSentences(left, right); break;
  }
  return { changes, jsonError: null };
}

export function DiffCheckerTool() {
  const searchParams = useSearchParams();
  const [left, setLeft] = useState(() => {
    const v = searchParams.get('left');
    return v ? decodeURIComponent(v) : '';
  });
  const [right, setRight] = useState('');
  const [mode, setMode] = useState<DiffMode>('line');
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const [monacoLang, setMonacoLang] = useState('plaintext');
  const [renderSideBySide, setRenderSideBySide] = useState(true);
  const [changes, setChanges] = useState<import('diff').Change[]>([]);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  const handleAutoDetect = useCallback(() => {
    const detected = detectLanguage(left || right);
    setMonacoLang(detected);
  }, [left, right]);

  useEffect(() => {
    if (viewMode === 'monaco') return;
    if (!left && !right) {
      setChanges([]);
      setJsonError(null);
      return;
    }
    let cancelled = false;
    import('diff').then((Diff) => {
      if (cancelled) return;
      const result = computeDiff(Diff, left, right, mode);
      setChanges(result.changes);
      setJsonError(result.jsonError);
    });
    return () => { cancelled = true; };
  }, [left, right, mode, viewMode]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const c of changes) {
      if (c.added) added += c.count ?? 0;
      if (c.removed) removed += c.count ?? 0;
    }
    return { added, removed };
  }, [changes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">View</p>
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
            <ToggleGroupItem value="simple">Simple</ToggleGroupItem>
            <ToggleGroupItem value="monaco">Monaco</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {viewMode === 'simple' && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Diff mode</p>
            <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as DiffMode)}>
              {MODES.map((m) => (
                <ToggleGroupItem key={m.id} value={m.id}>{m.label}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {viewMode === 'monaco' && (
          <>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Language</p>
              <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup type="single" value={monacoLang} onValueChange={(v) => v && setMonacoLang(v)} className="flex-wrap">
                  {LANGUAGES.map((l) => (
                    <ToggleGroupItem key={l.id} value={l.id} className="text-xs">{l.label}</ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <Button variant="ghost" size="sm" className="text-xs" onClick={handleAutoDetect}>Auto-detect</Button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Layout</p>
              <ToggleGroup type="single" value={renderSideBySide ? 'side' : 'inline'} onValueChange={(v) => v && setRenderSideBySide(v === 'side')}>
                <ToggleGroupItem value="side" className="text-xs">Side by Side</ToggleGroupItem>
                <ToggleGroupItem value="inline" className="text-xs">Inline</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </>
        )}

        {viewMode === 'simple' && (left || right) && (
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+{stats.added}</span>{' '}
            <span className="text-red-500">-{stats.removed}</span>
          </p>
        )}
      </div>

      {viewMode === 'monaco' ? (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-md border border-border">
            <DiffEditor
              height="550px"
              language={monacoLang}
              original={left}
              modified={right}
              theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
              options={{
                renderSideBySide,
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: false,
                originalEditable: true,
                padding: { top: 12 },
              }}
              onMount={(editor) => {
                const orig = editor.getOriginalEditor();
                const mod = editor.getModifiedEditor();
                orig.onDidChangeModelContent(() => setLeft(orig.getValue()));
                mod.onDidChangeModelContent(() => setRight(mod.getValue()));
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Original</p>
              <Textarea value={left} onChange={(e) => setLeft(e.target.value)} rows={14} className="font-mono text-sm" placeholder="Paste original text..." autoFocus />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Modified</p>
              <Textarea value={right} onChange={(e) => setRight(e.target.value)} rows={14} className="font-mono text-sm" placeholder="Paste modified text..." />
            </div>
          </div>

          {!left && !right && (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">Paste text on both sides to compare</p>
              <p className="mt-1 text-xs text-muted-foreground/70">Supports line, word, character, sentence, and JSON semantic diff</p>
            </div>
          )}

          {jsonError && (
            <div className="rounded-md border border-amber-500/50 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
              Parse error (falling back to text diff): {jsonError}
            </div>
          )}

          {changes.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Diff output</p>
                <CopyButton value={generateUnifiedDiff(changes)} size="sm" className="h-6 w-6" />
              </div>
              <div className="overflow-x-auto rounded-md border border-border p-4 font-mono text-sm">
                {changes.map((part, i) => (
                  <span
                    key={i}
                    className={cn(
                      part.added && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                      part.removed && 'bg-red-100 text-red-800 line-through dark:bg-red-900/30 dark:text-red-300',
                    )}
                  >
                    {mode === 'line'
                      ? part.value.split('\n').map((line, j) =>
                        line || j < (part.value.split('\n').length - 1) ? (
                          <div key={j}>
                            {part.added && '+ '}
                            {part.removed && '- '}
                            {!part.added && !part.removed && '  '}
                            {line}
                          </div>
                        ) : null,
                      )
                      : part.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
