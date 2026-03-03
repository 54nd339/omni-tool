'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTimestamp } from '@/hooks/use-timestamp';
import { useToolParams } from '@/hooks/use-tool-params';

import { CountdownPanel } from './countdown-panel';
import { CronPanel } from './cron-panel';
import { StopwatchPanel } from './stopwatch-panel';

export function TimestampTool() {
  const [params, setParams] = useToolParams({
    epoch: '',
    expression: '0 9 * * 1-5',
    iso: '',
    tab: 'time',
    target: '',
  });
  const {
    countdownOpen,
    elapsed,
    epoch,
    epochAtTarget,
    epochDate,
    epochValid,
    handleLap,
    handleReset,
    handleStart,
    handleStop,
    isoDate,
    isoInput,
    isoValid,
    laps,
    now,
    remaining,
    running,
    setCountdownOpen,
    setEpoch,
    setIsoInput,
    setStopwatchOpen,
    setTargetDate,
    stopwatchOpen,
    targetDate,
  } = useTimestamp();

  useEffect(() => {
    if (params.epoch) setEpoch(params.epoch);
  }, [params.epoch, setEpoch]);

  useEffect(() => {
    if (params.iso) setIsoInput(params.iso);
  }, [params.iso, setIsoInput]);

  useEffect(() => {
    if (params.target) setTargetDate(params.target);
  }, [params.target, setTargetDate]);

  const tab = params.tab === 'cron' ? 'cron' : 'time';

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
        <ToggleGroup
          type="single"
          value={tab}
          onValueChange={(value) => value && setParams({ tab: value })}
        >
          <ToggleGroupItem value="time">Time & Epoch</ToggleGroupItem>
          <ToggleGroupItem value="cron">Cron Builder</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {tab === 'time' && (
        <div className="space-y-8">
          <div className="rounded-md border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground">Current time</p>
            <div className="mt-2 grid gap-1 text-sm">
              <div className="flex items-center">
                <span className="w-24 text-muted-foreground">UTC</span>
                <code>{now.utc().format('YYYY-MM-DD HH:mm:ss')}</code>
                <CopyButton value={now.utc().format()} size="sm" className="ml-2" />
              </div>
              <div className="flex items-center">
                <span className="w-24 text-muted-foreground">Local</span>
                <code>{now.format('YYYY-MM-DD HH:mm:ss Z')}</code>
                <CopyButton value={now.format()} size="sm" className="ml-2" />
              </div>
              <div className="flex items-center">
                <span className="w-24 text-muted-foreground">Epoch (s)</span>
                <code>{now.unix()}</code>
                <CopyButton value={String(now.unix())} size="sm" className="ml-2" />
              </div>
              <div className="flex items-center">
                <span className="w-24 text-muted-foreground">Epoch (ms)</span>
                <code>{now.valueOf()}</code>
                <CopyButton value={String(now.valueOf())} size="sm" className="ml-2" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Epoch to date</p>
              <div className="flex items-center gap-2">
                <Input
                  value={epoch}
                  onChange={(event) => {
                    const nextEpoch = event.target.value;
                    setEpoch(nextEpoch);
                    setParams({ epoch: nextEpoch });
                  }}
                  placeholder="Unix timestamp"
                  className="w-full font-mono"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const nextEpoch = String(Math.floor(Date.now() / 1000));
                    setEpoch(nextEpoch);
                    setParams({ epoch: nextEpoch });
                  }}
                  aria-label="Set to current time"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {epochValid && (
                <div className="grid gap-1 text-sm">
                  <div>
                    <span className="inline-block w-20 text-muted-foreground">UTC: </span>
                    <code>{epochDate.utc().format('YYYY-MM-DD HH:mm:ss')}</code>
                  </div>
                  <div>
                    <span className="inline-block w-20 text-muted-foreground">Local: </span>
                    <code>{epochDate.format('YYYY-MM-DD HH:mm:ss Z')}</code>
                  </div>
                  <div>
                    <span className="inline-block w-20 text-muted-foreground">Relative: </span>
                    <code>{epochDate.fromNow()}</code>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Date to epoch</p>
              <Input
                value={isoInput}
                onChange={(event) => {
                  const nextIsoInput = event.target.value;
                  setIsoInput(nextIsoInput);
                  setParams({ iso: nextIsoInput });
                }}
                placeholder="ISO 8601 or any date string"
                className="w-full font-mono"
              />
              {isoValid && (
                <div className="grid gap-1 text-sm">
                  <div className="flex items-center">
                    <span className="w-24 text-muted-foreground">Epoch (s): </span>
                    <code>{isoDate.unix()}</code>
                    <CopyButton value={String(isoDate.unix())} size="sm" className="ml-2" />
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-muted-foreground">Epoch (ms): </span>
                    <code>{isoDate.valueOf()}</code>
                    <CopyButton value={String(isoDate.valueOf())} size="sm" className="ml-2" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <CountdownPanel
            countdownOpen={countdownOpen}
            epochAtTarget={epochAtTarget}
            remaining={remaining}
            targetDate={targetDate}
            onTargetDateChange={(nextTargetDate) => {
              setTargetDate(nextTargetDate);
              setParams({ target: nextTargetDate });
            }}
            onToggle={() => setCountdownOpen((open) => !open)}
          />

          <Separator />

          <StopwatchPanel
            laps={laps}
            running={running}
            stopwatchOpen={stopwatchOpen}
            elapsed={elapsed}
            onLap={handleLap}
            onReset={handleReset}
            onStart={handleStart}
            onStop={handleStop}
            onToggle={() => setStopwatchOpen((open) => !open)}
          />
        </div>
      )}

      {tab === 'cron' && (
        <CronPanel
          expression={params.expression}
          setExpression={(value) => setParams({ expression: value })}
        />
      )}
    </div>
  );
}
