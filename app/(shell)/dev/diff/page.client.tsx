'use client';

import { useState } from 'react';
import type { Change } from 'diff';
import { ToolLayout, ControlPanel, TextAreaInput, Button, CopyButton, Select } from '@/app/components/shared';
import { useClipboard } from '@/app/lib/hooks';
import { computeDiff, diffToText } from '@/app/lib/tools';
import { DiffMode } from '@/app/lib/types';
import { DEV_DEFAULTS, DIFF_MODES } from '@/app/lib/constants';

export default function DiffPage() {
  const [text1, setText1] = useState<string>(DEV_DEFAULTS.DIFF_TEXT1);
  const [text2, setText2] = useState<string>(DEV_DEFAULTS.DIFF_TEXT2);
  const [diff, setDiff] = useState<Change[]>([]);
  const [mode, setMode] = useState<DiffMode>(DEV_DEFAULTS.DIFF_MODE);
  const diffText = diffToText(diff);
  const clipboard = useClipboard();

  const handleComputeDiff = () => {
    setDiff(computeDiff(text1, text2, mode));
  };

  return (
    <ToolLayout path="/dev/diff">
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Select
              label="Diff Mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as DiffMode)}
            >
              {DIFF_MODES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleComputeDiff} className="w-full">
              Compare
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ControlPanel title="Text 1">
            <TextAreaInput label="First text" value={text1} onChange={setText1} rows={6} />
          </ControlPanel>
          <ControlPanel title="Text 2">
            <TextAreaInput label="Second text" value={text2} onChange={setText2} rows={6} />
          </ControlPanel>
        </div>

        {diff.length > 0 && (
          <ControlPanel title="Diff Result">
            <div className={`bg-slate-50 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto ${mode === 'chars' || mode === 'words' ? '' : 'whitespace-pre-wrap'}`}>
              {diff.map((part, index) => (
                <span
                  key={index}
                  className={`${mode === 'chars' || mode === 'words' ? 'inline' : 'block'} ${part.added
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : part.removed
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      : 'text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {part.value}
                </span>
              ))}
            </div>

            <div className="space-y-2">
              <CopyButton
                value={diffText}
                onCopy={() => diffText && clipboard.copy(diffText)}
                copied={clipboard.copied}
                disabled={!diff.length}
                label="Copy Diff"
              />
            </div>
          </ControlPanel>
        )}
      </div>
    </ToolLayout>
  );
}
