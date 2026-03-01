'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared/copy-button';

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at 9 AM', value: '0 9 * * *' },
  { label: 'Weekly (Mon 9 AM)', value: '0 9 * * 1' },
  { label: 'Monthly (1st, midnight)', value: '0 0 1 * *' },
  { label: 'Yearly (Jan 1, midnight)', value: '0 0 1 1 *' },
];

export function CronBuilderTool() {
  const [expression, setExpression] = useState('0 9 * * 1-5');
  const [description, setDescription] = useState<string | null>(null);
  const [nextRuns, setNextRuns] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import('cronstrue'), import('cron-parser')]).then(
      ([cronstrueModule, cronParserModule]) => {
        if (cancelled) return;
        const cronstrue = cronstrueModule.default;
        const { CronExpressionParser } = cronParserModule;
        try {
          setDescription(cronstrue.toString(expression, { verbose: true }));
        } catch {
          setDescription(null);
        }
        try {
          const interval = CronExpressionParser.parse(expression);
          const runs: string[] = [];
          for (let i = 0; i < 10; i++) {
            runs.push(interval.next().toDate().toLocaleString());
          }
          setNextRuns(runs);
        } catch {
          setNextRuns(null);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [expression]);

  const parts = expression.split(/\s+/);
  const fields = ['Minute', 'Hour', 'Day (month)', 'Month', 'Day (week)'];

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Cron Expression</p>
        <div className="flex items-center gap-2">
          <Input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="* * * * *"
            className="font-mono"
            autoFocus
          />
          <CopyButton value={expression} />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {fields.map((field, i) => (
          <div key={field}>
            <p className="mb-1 text-center text-[10px] font-medium text-muted-foreground">{field}</p>
            <Input
              value={parts[i] ?? '*'}
              onChange={(e) => {
                const next = [...parts];
                while (next.length < 5) next.push('*');
                next[i] = e.target.value || '*';
                setExpression(next.join(' '));
              }}
              className="text-center font-mono text-sm"
            />
          </div>
        ))}
      </div>

      {description && (
        <div className="rounded-md border border-border bg-muted/50 p-4">
          <p className="text-sm font-medium">{description}</p>
        </div>
      )}

      {!description && expression.trim() && (
        <p className="text-xs text-destructive">Invalid cron expression</p>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant="outline"
              size="sm"
              onClick={() => setExpression(preset.value)}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {nextRuns && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Next 10 Runs</p>
          <div className="space-y-1">
            {nextRuns.map((run, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm">
                <span className="text-muted-foreground">{i + 1}.</span>
                <span className="font-mono">{run}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
