'use client';

import { useMemo, useState, useEffect } from 'react';
import { useToolParams } from '@/hooks';
import { Textarea } from '@/components/ui/textarea';
import { CopyButton } from '@/components/shared/copy-button';

interface CaseOption {
  id: string;
  label: string;
  fn: (s: string) => string;
}

function toWords(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-./\\]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const CASES: CaseOption[] = [
  { id: 'upper', label: 'UPPER CASE', fn: (s) => s.toUpperCase() },
  { id: 'lower', label: 'lower case', fn: (s) => s.toLowerCase() },
  {
    id: 'title',
    label: 'Title Case',
    fn: (s) => toWords(s).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' '),
  },
  {
    id: 'sentence',
    label: 'Sentence case',
    fn: (s) => {
      const lowered = s.toLowerCase();
      return lowered.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
    },
  },
  {
    id: 'camel',
    label: 'camelCase',
    fn: (s) => {
      const words = toWords(s);
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
        .join('');
    },
  },
  {
    id: 'pascal',
    label: 'PascalCase',
    fn: (s) => toWords(s).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(''),
  },
  {
    id: 'snake',
    label: 'snake_case',
    fn: (s) => toWords(s).map((w) => w.toLowerCase()).join('_'),
  },
  {
    id: 'kebab',
    label: 'kebab-case',
    fn: (s) => toWords(s).map((w) => w.toLowerCase()).join('-'),
  },
  {
    id: 'constant',
    label: 'CONSTANT_CASE',
    fn: (s) => toWords(s).map((w) => w.toUpperCase()).join('_'),
  },
  {
    id: 'dot',
    label: 'dot.case',
    fn: (s) => toWords(s).map((w) => w.toLowerCase()).join('.'),
  },
  {
    id: 'path',
    label: 'path/case',
    fn: (s) => toWords(s).map((w) => w.toLowerCase()).join('/'),
  },
];

const DEFAULTS = { text: '' };

export function TextCaseTool() {
  const [params, setParams] = useToolParams(DEFAULTS);
  const [input, setInput] = useState(params.text);

  // Sync back to URL state cleanly with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input !== params.text) {
        setParams({ text: input });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [input, params.text, setParams]);

  const stats = useMemo(() => {
    if (!input) return { chars: 0, words: 0, lines: 0 };
    return {
      chars: input.length,
      words: input.trim().split(/\s+/).filter(Boolean).length,
      lines: input.split('\n').length,
    };
  }, [input]);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Input</p>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text to convert..."
          rows={5}
          autoFocus
        />
        <div className="mt-1.5 flex gap-4 text-[11px] text-muted-foreground">
          <span>{stats.chars} chars</span>
          <span>{stats.words} words</span>
          <span>{stats.lines} lines</span>
        </div>
      </div>

      {input && (
        <div className="grid gap-3 sm:grid-cols-2">
          {CASES.map((c) => (
            <CaseResult key={c.id} label={c.label} value={c.fn(input)} />
          ))}
        </div>
      )}
    </div>
  );
}

function CaseResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <CopyButton value={value} size="sm" className="h-6 w-6" />
      </div>
      <code className="block break-all text-sm">{value}</code>
    </div>
  );
}
