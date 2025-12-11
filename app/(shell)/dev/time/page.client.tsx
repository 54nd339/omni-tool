'use client';

import React, { useState } from 'react';
import { Clock, Copy, Check } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import cronstrue from 'cronstrue';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { Button } from '@/app/components/shared/Button';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function TimePage() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [timestampResult, setTimestampResult] = useState('');
  const [timestampCopied, setTimestampCopied] = useState(false);

  const [date, setDate] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));
  const [dateResult, setDateResult] = useState('');
  const [dateCopied, setDateCopied] = useState(false);

  const [cron, setCron] = useState('0 0 * * *');
  const [cronResult, setCronResult] = useState('');
  const [cronCopied, setCronCopied] = useState(false);

  const convertTimestamp = () => {
    try {
      const num = parseInt(timestamp);
      const d = dayjs.unix(num);
      setTimestampResult(`ISO: ${d.toISOString()}\nLocal: ${d.format('YYYY-MM-DD HH:mm:ss')}\nUTC: ${d.utc().format('YYYY-MM-DD HH:mm:ss')}`);
    } catch (e) {
      setTimestampResult('Invalid timestamp');
    }
  };

  const convertDate = () => {
    try {
      const d = dayjs(date);
      const ts = d.unix();
      setDateResult(`Unix: ${ts}\nISO: ${d.toISOString()}\nLocal: ${d.format('YYYY-MM-DD HH:mm:ss')}\nUTC: ${d.utc().format('YYYY-MM-DD HH:mm:ss')}`);
    } catch (e) {
      setDateResult('Invalid date');
    }
  };

  const describeCron = () => {
    try {
      const description = cronstrue.toString(cron);
      setCronResult(description);
    } catch (e) {
      setCronResult(`Error: ${(e as Error).message}`);
    }
  };

  const handleCopy = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout icon={Clock} title="Timestamp & Cron" description="Convert timestamps and explain cron expressions">
      <div className="space-y-6">
        {/* Unix Timestamp Converter */}
        <ControlPanel title="Unix Timestamp Converter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Unix Timestamp (seconds)</label>
                <input
                  type="number"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                  placeholder="1699999999"
                />
              </div>
              <Button onClick={convertTimestamp} className="w-full">
                Convert to Date
              </Button>
            </div>
            {timestampResult && (
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">Result</label>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                  <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{timestampResult}</pre>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => handleCopy(timestampResult, setTimestampCopied)} 
                  className="w-full flex items-center justify-center gap-2"
                >
                  {timestampCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Result
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </ControlPanel>

        {/* Date to Timestamp Converter */}
        <ControlPanel title="Date to Unix Timestamp Converter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={date.slice(0, 16)}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                />
              </div>
              <Button onClick={convertDate} className="w-full">
                Convert to Timestamp
              </Button>
            </div>
            {dateResult && (
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">Result</label>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                  <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{dateResult}</pre>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => handleCopy(dateResult, setDateCopied)} 
                  className="w-full flex items-center justify-center gap-2"
                >
                  {dateCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Result
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </ControlPanel>

        {/* Cron Expression Explainer */}
        <ControlPanel title="Cron Expression Explainer">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Cron Expression</label>
                <input
                  type="text"
                  value={cron}
                  onChange={(e) => setCron(e.target.value)}
                  placeholder="0 0 * * *"
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Format: minute hour day month weekday</p>
              </div>
              <Button onClick={describeCron} className="w-full">
                Explain Expression
              </Button>
            </div>
            {cronResult && (
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">Result</label>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-700 dark:text-slate-300 break-words">{cronResult}</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => handleCopy(cronResult, setCronCopied)} 
                  className="w-full flex items-center justify-center gap-2"
                >
                  {cronCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Result
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </ControlPanel>
      </div>
    </ToolLayout>
  );
}
