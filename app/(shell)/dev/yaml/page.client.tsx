'use client';

import React, { useState } from 'react';
import { FileJson, Copy, Check, AlertCircle } from 'lucide-react';
import * as yaml from 'js-yaml';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { TwoColumnLayout } from '@/app/components/shared/TwoColumnLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { TextAreaInput } from '@/app/components/shared/TextAreaInput';
import { Button } from '@/app/components/shared/Button';

export default function YamlPage() {
  const [input, setInput] = useState('name: OmniTool\nversion: 1.0\nauthor: Team');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleValidate = () => {
    try {
      const parsed = yaml.load(input);
      setOutput(JSON.stringify(parsed, null, 2));
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
    <ToolLayout
      icon={FileJson}
      title="YAML Validator"
      description="Validate YAML syntax and convert to JSON"
    >
      <TwoColumnLayout
        left={
          <div className="space-y-4">
            <ControlPanel title="Input">
              <TextAreaInput label="YAML input" value={input} onChange={setInput} placeholder="key: value" rows={8} />
            </ControlPanel>

            <Button onClick={handleValidate} className="w-full">
              Validate & Convert
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
                <ControlPanel title="JSON Output">
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
