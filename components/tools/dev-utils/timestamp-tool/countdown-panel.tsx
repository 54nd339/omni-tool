'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Input } from '@/components/ui/input';

interface CountdownPanelProps {
  countdownOpen: boolean;
  epochAtTarget: number;
  remaining: string;
  targetDate: string;
  onTargetDateChange: (value: string) => void;
  onToggle: () => void;
}

export function CountdownPanel({
  countdownOpen,
  epochAtTarget,
  remaining,
  targetDate,
  onTargetDateChange,
  onToggle,
}: CountdownPanelProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        {countdownOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        Countdown
      </button>
      {countdownOpen && (
        <div className="space-y-3 pt-2">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Target Date & Time</p>
            <Input
              type="datetime-local"
              value={targetDate}
              onChange={(event) => onTargetDateChange(event.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="rounded-md border border-border p-6 text-center">
            <p className="font-mono text-3xl font-bold tracking-tight">{remaining}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Epoch at target: <code className="font-mono">{epochAtTarget}</code>
            </p>
            <CopyButton value={String(epochAtTarget)} size="sm" />
          </div>
        </div>
      )}
    </div>
  );
}
