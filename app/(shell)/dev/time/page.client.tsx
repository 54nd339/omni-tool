'use client';

import { useState } from 'react';
import { ToolLayout, ControlPanel, Button, ResultDisplay, Input } from '@/app/components/shared';
import { convertUnixTimestamp, convertDateTime, describeCronExpression } from '@/app/lib/tools';
import { DEV_DEFAULTS } from '@/app/lib/constants';

export default function TimePage() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [timestampResult, setTimestampResult] = useState('');

  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [dateResult, setDateResult] = useState('');

  const [cron, setCron] = useState<string>(DEV_DEFAULTS.CRON_EXPRESSION);
  const [cronResult, setCronResult] = useState('');

  const convertTimestamp = () => {
    const { result, error } = convertUnixTimestamp(timestamp);
    setTimestampResult(result || error || '');
  };

  const convertDate = () => {
    const { result, error } = convertDateTime(date);
    setDateResult(result || error || '');
  };

  const describeCron = () => {
    const { result, error } = describeCronExpression(cron);
    setCronResult(result || error || '');
  };

  return (
    <ToolLayout path="/dev/time">
      <div className="space-y-6">
        <ControlPanel title="Unix Timestamp Converter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input
                type="number"
                label="Unix Timestamp (seconds)"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="1699999999"
              />
              <Button onClick={convertTimestamp} className="w-full">
                Convert to Date
              </Button>
            </div>
            {timestampResult && (
              <ResultDisplay value={timestampResult} />
            )}
          </div>
        </ControlPanel>

        <ControlPanel title="Date to Unix Timestamp Converter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input
                type="datetime-local"
                label="Date & Time"
                value={date.slice(0, 16)}
                onChange={(e) => setDate(e.target.value)}
              />
              <Button onClick={convertDate} className="w-full">
                Convert to Timestamp
              </Button>
            </div>
            {dateResult && (
              <ResultDisplay value={dateResult} />
            )}
          </div>
        </ControlPanel>

        <ControlPanel title="Cron Expression Explainer">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input
                type="text"
                label="Cron Expression"
                value={cron}
                onChange={(e) => setCron(e.target.value)}
                placeholder="0 0 * * *"
                helperText="Format: minute hour day month weekday"
              />
              <Button onClick={describeCron} className="w-full">
                Explain Expression
              </Button>
            </div>
            {cronResult && (
              <ResultDisplay value={cronResult}>
                <p className="text-sm text-slate-700 dark:text-slate-300 break-words">{cronResult}</p>
              </ResultDisplay>
            )}
          </div>
        </ControlPanel>
      </div>
    </ToolLayout>
  );
}
