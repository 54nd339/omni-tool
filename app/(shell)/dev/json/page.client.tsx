'use client';

import React, { useState } from 'react';
import { Code, Copy, Check, AlertCircle, CheckCircle } from 'lucide-react';
import Ajv from 'ajv';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { TwoColumnLayout } from '@/app/components/shared/TwoColumnLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { TextAreaInput } from '@/app/components/shared/TextAreaInput';
import { Button } from '@/app/components/shared/Button';

const ajv = new Ajv({ allErrors: true });

export default function JsonPage() {
  const [input, setInput] = useState('{"name":"OmniTool","version":"1.0"}');
  const [schema, setSchema] = useState('{"type":"object","properties":{"name":{"type":"string"},"version":{"type":"string"}}}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors?: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
      setValidationResult(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
      setValidationResult(null);
    }
  };

  const handleValidateWithSchema = () => {
    try {
      const parsed = JSON.parse(input);
      const schemaObj = JSON.parse(schema);
      const validate = ajv.compile(schemaObj);
      const valid = validate(parsed);
      
      if (valid) {
        setValidationResult({ valid: true });
        setOutput(JSON.stringify(parsed, null, 2));
        setError('');
      } else {
        setValidationResult({
          valid: false,
          errors: validate.errors?.map((err) => `${err.instancePath} ${err.message}`) || [],
        });
        setOutput('');
        setError('');
      }
    } catch (e) {
      setError((e as Error).message);
      setValidationResult(null);
      setOutput('');
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
      setValidationResult(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
      setValidationResult(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout icon={Code} title="JSON Validator" description="Validate, format, and validate against JSON Schema">
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
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
                </div>
              </div>
            )}

            {validationResult && (
              <div
                className={`${
                  validationResult.valid
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
                  <TextAreaInput label="Result" value={output} onChange={() => {}} readOnly rows={10} />
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
