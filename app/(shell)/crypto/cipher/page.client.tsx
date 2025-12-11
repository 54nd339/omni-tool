'use client';

import React, { useState } from 'react';
import { Lock, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { TwoColumnLayout } from '@/app/components/shared/TwoColumnLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { TextAreaInput } from '@/app/components/shared/TextAreaInput';
import { Button } from '@/app/components/shared/Button';
import { aesEncrypt, aesDecrypt, rot13 } from '@/app/lib/tools/crypto';
import { caesarCipher, copyToClipboard } from '@/app/lib/utils/text';
import { UI_CONSTANTS } from '@/app/lib/constants';

type CipherMode = 'aes' | 'caesar' | 'rot13';

export default function CipherPage() {
  const [input, setInput] = useState('');
  const [secret, setSecret] = useState<string>(UI_CONSTANTS.CRYPTO.DEFAULT_SECRET);
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<CipherMode>('aes');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    if (!input) return;
    setLoading(true);
    try {
      let result: string;
      switch (mode) {
        case 'aes':
          result = aesEncrypt(secret, input);
          break;
        case 'caesar':
          result = caesarCipher.encode(input, UI_CONSTANTS.CRYPTO.CAESAR_SHIFT);
          break;
        case 'rot13':
          result = rot13(input);
          break;
        default:
          result = input;
      }
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = () => {
    if (!input) return;
    setLoading(true);
    try {
      let result: string;
      switch (mode) {
        case 'aes':
          result = aesDecrypt(secret, input);
          break;
        case 'caesar':
          result = caesarCipher.decode(input, UI_CONSTANTS.CRYPTO.CAESAR_SHIFT);
          break;
        case 'rot13':
          result = rot13(input);
          break;
        default:
          result = input;
      }
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), UI_CONSTANTS.ANIMATION.COPY_FEEDBACK_DURATION);
  };

  return (
    <ToolLayout icon={Lock} title="Cipher Tools" description="Encode/decode with AES, Caesar, ROT13">
      <TwoColumnLayout
        left={
          <div className="space-y-4">
            <ControlPanel title="Input">
              <TextAreaInput
                label="Text to process"
                value={input}
                onChange={setInput}
                placeholder="Enter text..."
                rows={6}
              />
            </ControlPanel>

            <ControlPanel title="Cipher Method">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as CipherMode)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="aes">AES Encryption</option>
                <option value="caesar">Caesar Cipher</option>
                <option value="rot13">ROT13</option>
              </select>
            </ControlPanel>

            {mode === 'aes' && (
              <ControlPanel title="Secret Key">
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter secret key"
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </ControlPanel>
            )}

            <div className="flex gap-2">
              <Button onClick={handleEncode} loading={loading} className="flex-1">
                Encode
              </Button>
              <Button onClick={handleDecode} loading={loading} variant="outline" className="flex-1">
                Decode
              </Button>
            </div>
          </div>
        }
        right={
          <div className="space-y-4">
            <ControlPanel title="Output">
              <TextAreaInput label="Result" value={output} onChange={() => {}} readOnly rows={6} />
            </ControlPanel>

            {output && (
              <Button variant="outline" onClick={handleCopy} className="w-full flex items-center justify-center gap-2">
                {copied ? (
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
            )}
          </div>
        }
      />
    </ToolLayout>
  );
}
