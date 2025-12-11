'use client';

import { useState } from 'react';
import { ToolLayout, TwoColumnLayout, ControlPanel, TextAreaInput, Button, CopyButton, ErrorAlert } from '@/app/components/shared';
import { useClipboard } from '@/app/lib/hooks';
import { formatXml } from '@/app/lib/tools';
import { DEV_DEFAULTS } from '@/app/lib/constants';

export default function XmlPage() {
  const [input, setInput] = useState<string>(DEV_DEFAULTS.XML_INPUT);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const clipboard = useClipboard();

  const handleValidate = () => {
    const { result, error: xmlError } = formatXml(input);
    setOutput(result || '');
    setError(xmlError || '');
  };

  return (
    <ToolLayout path="/dev/xml">
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
            <ErrorAlert error={error} />

            {output && (
              <>
                <ControlPanel title="Output">
                  <TextAreaInput label="Result" value={output} onChange={() => {}} readOnly rows={8} />
                </ControlPanel>

                <CopyButton
                  value={output}
                  onCopy={() => clipboard.copy(output)}
                  copied={clipboard.copied}
                  disabled={!output}
                />
              </>
            )}
          </div>
        }
      />
    </ToolLayout>
  );
}
