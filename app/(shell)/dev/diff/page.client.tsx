'use client';

import React, { useState } from 'react';
import { GitCompare, Copy, Check } from 'lucide-react';
import { diffLines, diffWords, diffChars, diffSentences, Change } from 'diff';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { TwoColumnLayout } from '@/app/components/shared/TwoColumnLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { TextAreaInput } from '@/app/components/shared/TextAreaInput';
import { Button } from '@/app/components/shared/Button';

type DiffMode = 'lines' | 'words' | 'chars' | 'sentences';

export default function DiffPage() {
  const [text1, setText1] = useState('Hello World');
  const [text2, setText2] = useState('Hello Universe');
  const [diff, setDiff] = useState<Change[]>([]);
  const [mode, setMode] = useState<DiffMode>('lines');
  const [copied, setCopied] = useState(false);

  const computeDiff = () => {
    let changes: Change[];
    switch (mode) {
      case 'lines':
        changes = diffLines(text1, text2);
        break;
      case 'words':
        changes = diffWords(text1, text2);
        break;
      case 'chars':
        changes = diffChars(text1, text2);
        break;
      case 'sentences':
        changes = diffSentences(text1, text2);
        break;
      default:
        changes = diffLines(text1, text2);
    }
    setDiff(changes);
  };

  const handleCopy = () => {
    const diffText = diff.map((part) => {
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      return part.value.split('\n').filter(Boolean).map((line) => prefix + line).join('\n');
    }).join('\n');
    navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout icon={GitCompare} title="Diff Checker" description="Compare two texts and visualize differences">
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Diff Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as DiffMode)}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="lines">Line by Line</option>
              <option value="words">Word by Word</option>
              <option value="chars">Character by Character</option>
              <option value="sentences">Sentence by Sentence</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={computeDiff} className="w-full">
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
                  className={`${mode === 'chars' || mode === 'words' ? 'inline' : 'block'} ${
                    part.added
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
              <Button variant="outline" onClick={handleCopy} className="w-full flex items-center justify-center gap-2">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Diff
                  </>
                )}
              </Button>
            </div>
          </ControlPanel>
        )}
      </div>
    </ToolLayout>
  );
}
