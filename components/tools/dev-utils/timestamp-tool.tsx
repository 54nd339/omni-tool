'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CopyButton } from '@/components/shared/copy-button';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0d 0h 0m 0s';
  const seconds = Math.floor(ms / 1000);
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

function formatStopwatch(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
}

export function TimestampTool() {
  const [epoch, setEpoch] = useState(String(Math.floor(Date.now() / 1000)));
  const [isoInput, setIsoInput] = useState(dayjs().toISOString());
  const [now, setNow] = useState(dayjs());

  // Countdown state
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [remaining, setRemaining] = useState('');
  const [countdownOpen, setCountdownOpen] = useState(false);

  // Stopwatch state
  const [stopwatchOpen, setStopwatchOpen] = useState(false);
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsed, setSwElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(id);
  }, []);

  // Countdown interval
  useEffect(() => {
    if (!countdownOpen) return;
    const update = () => {
      const target = new Date(targetDate).getTime();
      const nowMs = Date.now();
      setRemaining(formatCountdown(target - nowMs));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [countdownOpen, targetDate]);

  // Stopwatch interval
  useEffect(() => {
    if (!stopwatchOpen) return;
    if (swRunning) {
      startTimeRef.current = Date.now() - swElapsed;
      intervalRef.current = setInterval(() => {
        setSwElapsed(Date.now() - startTimeRef.current);
      }, 50);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [stopwatchOpen, swRunning]);

  const handleStart = useCallback(() => setSwRunning(true), []);
  const handleStop = useCallback(() => {
    setSwRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  const handleReset = useCallback(() => {
    setSwRunning(false);
    setSwElapsed(0);
    setLaps([]);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  const handleLap = useCallback(() => {
    setLaps((prev) => [...prev, swElapsed]);
  }, [swElapsed]);

  const epochNum = Number(epoch);
  const isMs = epoch.length > 12;
  const epochDate = dayjs(isMs ? epochNum : epochNum * 1000);
  const epochValid = epochDate.isValid() && epoch.trim() !== '';

  const isoDate = dayjs(isoInput);
  const isoValid = isoDate.isValid() && isoInput.trim() !== '';

  const epochAtTarget = Math.floor(new Date(targetDate).getTime() / 1000);

  return (
    <div className="space-y-8">
      {/* Live clock */}
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
        {/* Epoch converter */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Epoch to date
          </p>
          <div className="flex items-center gap-2">
            <Input
              value={epoch}
              onChange={(e) => setEpoch(e.target.value)}
              placeholder="Unix timestamp"
              className="w-full font-mono"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEpoch(String(Math.floor(Date.now() / 1000)))}
              aria-label="Set to current time"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {epochValid && (
            <div className="grid gap-1 text-sm">
              <div>
                <span className="text-muted-foreground w-20 inline-block">UTC: </span>
                <code>{epochDate.utc().format('YYYY-MM-DD HH:mm:ss')}</code>
              </div>
              <div>
                <span className="text-muted-foreground w-20 inline-block">Local: </span>
                <code>{epochDate.format('YYYY-MM-DD HH:mm:ss Z')}</code>
              </div>
              <div>
                <span className="text-muted-foreground w-20 inline-block">Relative: </span>
                <code>{epochDate.fromNow()}</code>
              </div>
            </div>
          )}
        </div>

        {/* ISO to epoch */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Date to epoch
          </p>
          <Input
            value={isoInput}
            onChange={(e) => setIsoInput(e.target.value)}
            placeholder="ISO 8601 or any date string"
            className="w-full font-mono"
          />
          {isoValid && (
            <div className="grid gap-1 text-sm">
              <div className="flex items-center">
                <span className="text-muted-foreground w-24">Epoch (s): </span>
                <code>{isoDate.unix()}</code>
                <CopyButton value={String(isoDate.unix())} size="sm" className="ml-2" />
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground w-24">Epoch (ms): </span>
                <code>{isoDate.valueOf()}</code>
                <CopyButton value={String(isoDate.valueOf())} size="sm" className="ml-2" />
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Countdown (collapsible) */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setCountdownOpen((o) => !o)}
          className="flex w-full items-center gap-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {countdownOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Countdown
        </button>
        {countdownOpen && (
          <div className="space-y-3 pt-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Target Date & Time</p>
              <Input
                type="datetime-local"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
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

      <Separator />

      {/* Stopwatch (collapsible) */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setStopwatchOpen((o) => !o)}
          className="flex w-full items-center gap-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {stopwatchOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Stopwatch
        </button>
        {stopwatchOpen && (
          <div className="space-y-3 pt-2">
            <div className="rounded-md border border-border p-6 text-center">
              <p className="font-mono text-3xl font-bold tracking-tight">
                {formatStopwatch(swElapsed)}
              </p>
            </div>
            <div className="flex gap-2">
              {!swRunning ? (
                <Button onClick={handleStart}>Start</Button>
              ) : (
                <Button variant="destructive" onClick={handleStop}>Stop</Button>
              )}
              {swRunning && <Button variant="outline" onClick={handleLap}>Lap</Button>}
              <Button variant="ghost" onClick={handleReset}>Reset</Button>
            </div>
            {laps.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Laps</p>
                <div className="space-y-1">
                  {laps.map((lap, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm">
                      <span className="text-muted-foreground">Lap {i + 1}</span>
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
    </div>
  );
}
