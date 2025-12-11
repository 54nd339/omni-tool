'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Hash as HashIcon, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { TextAreaInput } from '@/app/components/shared/TextAreaInput';
import { Button } from '@/app/components/shared/Button';
import { hashValue } from '@/app/lib/tools/crypto';
import { copyToClipboard } from '@/app/lib/utils/text';
import { UI_CONSTANTS } from '@/app/lib/constants';

interface HashResults {
  'SHA-1': string;
  'SHA-256': string;
  'SHA-512': string;
  'MD5': string;
}

export default function HashPage() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<HashResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState<keyof HashResults | null>(null);

  const computeAllHashes = useCallback((text: string) => {
    if (!text) {
      setHashes(null);
      return;
    }

    setLoading(true);
    try {
      const results: HashResults = {
        'SHA-1': hashValue.sha1(text),
        'SHA-256': hashValue.sha256(text),
        'SHA-512': hashValue.sha512(text),
        'MD5': hashValue.md5(text),
      };
      setHashes(results);
    } catch (error) {
      console.error('Hash error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    computeAllHashes(input);
  }, [input, computeAllHashes]);

  const handleCopy = async (algo: keyof HashResults) => {
    await copyToClipboard(hashes?.[algo] || '');
    setCopiedHash(algo);
    setTimeout(() => setCopiedHash(null), UI_CONSTANTS.ANIMATION.COPY_FEEDBACK_DURATION);
  };

  return (
    <ToolLayout
      icon={HashIcon}
      title="Hash Generator"
      description="Compute cryptographic hashes automatically for all algorithms"
    >
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(algo)}
                      className="flex items-center gap-1"
                    >
                      {copiedHash === algo ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </Button>
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
