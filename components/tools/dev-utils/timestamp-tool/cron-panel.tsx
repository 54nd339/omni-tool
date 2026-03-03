'use client';

import { useEffect, useState } from 'react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CRON_PRESETS,
  describeCron,
  getNextCronRuns,
} from '@/lib/dev-utils/cron-builder';

interface CronPanelProps {
  expression: string;
  setExpression: (value: string) => void;
}

export function CronPanel({ expression, setExpression }: CronPanelProps) {
  const [description, setDescription] = useState<string | null>(null);
  const [nextRuns, setNextRuns] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([describeCron(expression), getNextCronRuns(expression, 10)]).then(
      ([nextDescription, nextRunsResult]) => {
        if (cancelled) return;
        setDescription(nextDescription);
        setNextRuns(nextRunsResult);
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
            onChange={(event) => setExpression(event.target.value)}
            placeholder="* * * * *"
            className="font-mono"
            autoFocus
          />
          <CopyButton value={expression} />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {fields.map((field, index) => (
          <div key={field}>
            <p className="mb-1 text-center text-[10px] font-medium text-muted-foreground">
              {field}
            </p>
            <Input
              value={parts[index] ?? '*'}
              onChange={(event) => {
                const next = [...parts];
                while (next.length < 5) next.push('*');
                next[index] = event.target.value || '*';
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
          {CRON_PRESETS.map((preset) => (
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
            {nextRuns.map((run, index) => (
              <div
                key={run}
                className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
              >
                <span className="text-muted-foreground">{index + 1}.</span>
                <span className="font-mono">{run}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
