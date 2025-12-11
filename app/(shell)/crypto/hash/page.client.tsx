'use client';

import { useEffect, useState } from 'react';
import { ToolLayout, ControlPanel, TextAreaInput, CopyButton } from '@/app/components/shared';
import { useClipboard, useHashGenerator } from '@/app/lib/hooks';
import { HashResults } from '@/app/lib/types';

export default function HashPage() {
  const [input, setInput] = useState('');
  const [copiedHash, setCopiedHash] = useState<keyof HashResults | null>(null);
  const { hashes, loading, generate } = useHashGenerator();
  const clipboard = useClipboard();

  useEffect(() => {
    generate(input);
  }, [input, generate]);

  const handleCopy = async (algo: keyof HashResults) => {
    const value = hashes?.[algo] || '';
    await clipboard.copy(value);
    setCopiedHash(algo);
  };

  return (
    <ToolLayout path="/crypto/hash">
      <div className="space-y-4">
        <ControlPanel title="Input Text">
          <TextAreaInput
            label="Text to hash"
            value={input}
            onChange={setInput}
            placeholder="Enter text to hash..."
            rows={6}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Hashes compute automatically as you type</p>
        </ControlPanel>

        {hashes && (
          <ControlPanel title="Hash Results">
            <div className="space-y-3">
              {(Object.keys(hashes) as Array<keyof HashResults>).map((algo) => (
                <div key={algo} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{algo}</label>
                    <CopyButton
                      value={hashes?.[algo] || ''}
                      onCopy={() => handleCopy(algo)}
                      copied={copiedHash === algo && clipboard.copied}
                      disabled={!hashes?.[algo]}
                      className="text-xs"
                      label="Copy"
                    />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                    {loading ? (
                      <span className="text-slate-400">Computing...</span>
                    ) : (
                      hashes[algo]
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ControlPanel>
        )}
      </div>
    </ToolLayout>
  );
}
