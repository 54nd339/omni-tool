'use client';

import React, { useState } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { TwoColumnLayout } from '@/app/components/shared/TwoColumnLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { TextAreaInput } from '@/app/components/shared/TextAreaInput';
import { Button } from '@/app/components/shared/Button';
import { encodeText, decodeText, copyToClipboard } from '@/app/lib/utils/text';
import { UI_CONSTANTS } from '@/app/lib/constants';

type EncodingType = 'base64' | 'url' | 'html' | 'uri';

export default function UrlPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [encodingType, setEncodingType] = useState<EncodingType>('base64');
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    if (!input) return;
    try {
      const result = encodeText[encodingType](input);
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    }
  };

  const handleDecode = () => {
    if (!input) return;
    try {
      const result = decodeText[encodingType](input);
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), UI_CONSTANTS.ANIMATION.COPY_FEEDBACK_DURATION);
  };

  return (
    <ToolLayout
      icon={Link2}
      title="URL Encode/Decode"
      description="Encode/decode text to/from Base64, URL, HTML, and URI formats"
    >
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

            <ControlPanel title="Encoding Type">
              <select
                value={encodingType}
                onChange={(e) => setEncodingType(e.target.value as EncodingType)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="base64">Base64</option>
                <option value="url">URL Encode</option>
                <option value="html">HTML Entities</option>
                <option value="uri">URI Encode</option>
              </select>
            </ControlPanel>

            <div className="flex gap-2">
              <Button onClick={handleEncode} className="flex-1">
                Encode
              </Button>
              <Button onClick={handleDecode} variant="outline" className="flex-1">
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
