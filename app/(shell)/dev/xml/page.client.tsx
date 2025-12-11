'use client';

import React, { useState } from 'react';
import { Code2, Copy, Check, AlertCircle } from 'lucide-react';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { TwoColumnLayout } from '@/app/components/shared/TwoColumnLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { TextAreaInput } from '@/app/components/shared/TextAreaInput';
import { Button } from '@/app/components/shared/Button';

const parser = new XMLParser({ ignoreAttributes: false });
const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

export default function XmlPage() {
  const [input, setInput] = useState('<?xml version="1.0"?>\n<root>\n  <item>value</item>\n</root>');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleValidate = () => {
    try {
      const parsed = parser.parse(input);
      const formatted = builder.build(parsed);
      setOutput(formatted);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout icon={Code2} title="XML Validator" description="Validate and format XML documents">
      <TwoColumnLayout
        left={
          <div className="space-y-4">
            <ControlPanel title="Input">
              <TextAreaInput label="XML input" value={input} onChange={setInput} placeholder='<?xml version="1.0"?>' rows={8} />
            </ControlPanel>

            <Button onClick={handleValidate} className="w-full">
              Validate & Format
            </Button>
          </div>
        }
        right={
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
                </div>
              </div>
            )}

            {output && (
              <>
                <ControlPanel title="Output">
                  <TextAreaInput label="Result" value={output} onChange={() => {}} readOnly rows={8} />
                </ControlPanel>

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
              </>
            )}
          </div>
        }
      />
    </ToolLayout>
  );
}
