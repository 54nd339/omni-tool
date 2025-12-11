'use client';

import { useState } from 'react';
import { ToolLayout, TwoColumnLayout, ControlPanel, TextAreaInput, Button, CopyButton, ErrorAlert } from '@/app/components/shared';
import { useClipboard } from '@/app/lib/hooks';
import { yamlToJson } from '@/app/lib/tools';
import { DEV_DEFAULTS } from '@/app/lib/constants';

export default function YamlPage() {
  const [input, setInput] = useState<string>(DEV_DEFAULTS.YAML_INPUT);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const clipboard = useClipboard();

  const handleValidate = () => {
    const { result, error: yamlError } = yamlToJson(input);
    setOutput(result || '');
    setError(yamlError || '');
  };

  return (
    <ToolLayout path="/dev/yaml">
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
            <ErrorAlert error={error} />

            {output && (
              <>
                <ControlPanel title="JSON Output">
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
