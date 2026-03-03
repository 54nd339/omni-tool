'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';

import {
  ensureDayjsPlugins,
  formatCountdown,
} from '@/lib/dev-utils/timestamp';

ensureDayjsPlugins();

export function useTimestamp() {
  const [epoch, setEpoch] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [isoInput, setIsoInput] = useState(() => dayjs().toISOString());
  const [now, setNow] = useState(() => dayjs());

  const [targetDate, setTargetDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [remaining, setRemaining] = useState('');
  const [countdownOpen, setCountdownOpen] = useState(false);

  const [stopwatchOpen, setStopwatchOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!countdownOpen) return;

    const update = () => {
      const target = new Date(targetDate).getTime();
      setRemaining(formatCountdown(target - Date.now()));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [countdownOpen, targetDate]);

  useEffect(() => {
    if (!stopwatchOpen || !running) return;

    startTimeRef.current = Date.now() - elapsed;
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [elapsed, running, stopwatchOpen]);

  const handleStart = useCallback(() => setRunning(true), []);

  const handleStop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleReset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleLap = useCallback(() => {
    setLaps((previous) => [...previous, elapsed]);
  }, [elapsed]);

  const epochNumber = Number(epoch);
  const isMilliseconds = epoch.length > 12;
  const epochDate = dayjs(isMilliseconds ? epochNumber : epochNumber * 1000);
  const epochValid = epochDate.isValid() && epoch.trim() !== '';

  const isoDate = dayjs(isoInput);
  const isoValid = isoDate.isValid() && isoInput.trim() !== '';

  const epochAtTarget = Math.floor(new Date(targetDate).getTime() / 1000);

  return {
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
  };
}