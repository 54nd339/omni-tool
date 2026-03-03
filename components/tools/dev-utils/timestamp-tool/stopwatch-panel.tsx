'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { formatStopwatch } from '@/lib/dev-utils/timestamp';

interface StopwatchPanelProps {
  laps: number[];
  running: boolean;
  stopwatchOpen: boolean;
  elapsed: number;
  onLap: () => void;
  onReset: () => void;
  onStart: () => void;
  onStop: () => void;
  onToggle: () => void;
}

export function StopwatchPanel({
  laps,
  running,
  stopwatchOpen,
  elapsed,
  onLap,
  onReset,
  onStart,
  onStop,
  onToggle,
}: StopwatchPanelProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        {stopwatchOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        Stopwatch
      </button>
      {stopwatchOpen && (
        <div className="space-y-3 pt-2">
          <div className="rounded-md border border-border p-6 text-center">
            <p className="font-mono text-3xl font-bold tracking-tight">{formatStopwatch(elapsed)}</p>
          </div>
          <div className="flex gap-2">
            {!running ? (
              <Button onClick={onStart}>Start</Button>
            ) : (
              <Button variant="destructive" onClick={onStop}>Stop</Button>
            )}
            {running && <Button variant="outline" onClick={onLap}>Lap</Button>}
            <Button variant="ghost" onClick={onReset}>Reset</Button>
          </div>
          {laps.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Laps</p>
              <div className="space-y-1">
                {laps.map((lap, index) => (
                  <div
                    key={`${lap}-${index}`}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
                  >
                    <span className="text-muted-foreground">Lap {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{formatStopwatch(lap)}</span>
                      <CopyButton value={formatStopwatch(lap)} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
