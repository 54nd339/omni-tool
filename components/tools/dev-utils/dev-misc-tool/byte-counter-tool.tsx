'use client';

import { useMemo, useState } from 'react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeTextStats } from '@/lib/dev-utils/byte-counter';

interface StatCardProps {
  label: string;
  value: string | number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xl font-semibold tabular-nums">{value}</span>
        <CopyButton value={String(value)} size="sm" />
      </div>
    </div>
  );
}

export function ByteCounterTool() {
  const [text, setText] = useState('');

  const stats = useMemo(() => analyzeTextStats(text), [text]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Input</p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text to analyze..."
          className="min-h-[300px] h-[calc(100%-1.5rem)] font-mono text-sm resize-none"
          autoFocus
        />
      </div>

      <div className="space-y-4">
        <p className="text-xs font-medium text-muted-foreground">Output</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <StatCard label="Characters" value={stats.chars} />
          <StatCard label="Bytes (UTF-8)" value={stats.bytesUtf8} />
          <StatCard label="Bytes (UTF-16)" value={stats.bytesUtf16} />
          <StatCard label="Words" value={stats.wordCount} />
          <StatCard label="Lines" value={stats.lineCount} />
          <StatCard label="Sentences" value={stats.sentenceCount} />
          <StatCard label="Unique words" value={stats.uniqueWords} />
          <StatCard label="Reading time" value={stats.readingTime} />
        </div>
      </div>
    </div>
  );
}
