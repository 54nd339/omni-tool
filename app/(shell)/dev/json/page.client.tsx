'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ToolLayout, TwoColumnLayout, ControlPanel, TextAreaInput, Button, CopyButton, ErrorAlert } from '@/app/components/shared';
import { useClipboard } from '@/app/lib/hooks';
import { formatJson, minifyJson, validateJsonAgainstSchema } from '@/app/lib/tools';
import { JsonValidationResult } from '@/app/lib/types';
import { DEV_DEFAULTS } from '@/app/lib/constants';

export default function JsonPage() {
  const [input, setInput] = useState<string>(DEV_DEFAULTS.JSON_INPUT);
  const [schema, setSchema] = useState<string>(DEV_DEFAULTS.JSON_SCHEMA);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [validationResult, setValidationResult] = useState<JsonValidationResult | null>(null);
  const clipboard = useClipboard();

  const handleValidate = () => {
    const { result, error: validationError } = formatJson(input);
    setOutput(result || '');
    setError(validationError || '');
    setValidationResult(null);
  };

  const handleValidateWithSchema = () => {
    const { output: validatedOutput, validation, error: validationError } = validateJsonAgainstSchema(input, schema);
    setValidationResult(validation ?? null);
    setOutput(validatedOutput || '');
    setError(validationError || '');
  };

  const handleMinify = () => {
    const { result, error: minifyError } = minifyJson(input);
    setOutput(result || '');
    setError(minifyError || '');
    setValidationResult(null);
  };

  return (
    <ToolLayout path="/dev/json">
      <TwoColumnLayout
        left={
          <div className="space-y-4">
            <ControlPanel title="JSON Input">
              <TextAreaInput
                label="JSON input"
                value={input}
                onChange={setInput}
                placeholder='{"key":"value"}'
                rows={6}
              />
            </ControlPanel>

            <ControlPanel title="JSON Schema (Optional)">
              <TextAreaInput
                label="Schema"
                value={schema}
                onChange={setSchema}
                placeholder='{"type":"object"}'
                rows={4}
              />
            </ControlPanel>

            <div className="space-y-2">
              <Button onClick={handleValidate} className="w-full">
                Validate & Format
              </Button>
              <Button onClick={handleValidateWithSchema} variant="secondary" className="w-full">
                Validate with Schema
              </Button>
              <Button onClick={handleMinify} variant="outline" className="w-full">
                Minify
              </Button>
            </div>
          </div>
        }
        right={
          <div className="space-y-4">
            <ErrorAlert error={error} />

            {validationResult && (
              <div
                className={`${validationResult.valid
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  } border rounded-lg p-4`}
              >
                <div className="flex items-start gap-2">
                  {validationResult.valid ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm">
                    {validationResult.valid ? (
                      <span className="text-green-700 dark:text-green-200">Valid JSON against schema</span>
                    ) : (
                      <div className="text-red-700 dark:text-red-200">
                        <p className="font-medium mb-1">Schema validation failed:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {validationResult.errors?.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {output && (
              <>
                <ControlPanel title="Output">
                  <TextAreaInput label="Result" value={output} onChange={() => { }} readOnly rows={10} />
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
