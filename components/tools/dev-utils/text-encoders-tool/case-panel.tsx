'use client';

import { useEffect, useMemo, useState } from 'react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Textarea } from '@/components/ui/textarea';
import { useToolParams } from '@/hooks/use-tool-params';
import { TEXT_CASES } from '@/lib/dev-utils/text-case';

const DEFAULTS = { text: '' };

export function CasePanel() {
  const [params, setParams] = useToolParams(DEFAULTS);
  const [input, setInput] = useState(params.text);

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
          onChange={(event) => setInput(event.target.value)}
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
          {TEXT_CASES.map((item) => (
            <CaseResult key={item.id} label={item.label} value={item.fn(input)} />
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
