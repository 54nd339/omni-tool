'use client';

import { CodeEditor } from '@/components/shared/code-editor';
import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import type { ValidationResult } from '@/lib/dev-utils/json-yaml-xml';

interface SchemaTabProps {
  input: string;
  schema: string;
  validating: boolean;
  validationResult: ValidationResult | null;
  onGenerateSchema: () => void;
  onInputChange: (value: string) => void;
  onSchemaChange: (value: string) => void;
  onValidateSchema: () => void;
}

export function SchemaTab({
  input,
  schema,
  validating,
  validationResult,
  onGenerateSchema,
  onInputChange,
  onSchemaChange,
  onValidateSchema,
}: SchemaTabProps) {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <div className="mb-2 flex h-9 shrink-0 items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">JSON</p>
            <Button variant="ghost" size="sm" onClick={onGenerateSchema} className="text-xs">
              Auto-generate Schema
            </Button>
          </div>
          <div className="min-h-[400px] flex-1">
            <CodeEditor value={input} onChange={onInputChange} language="json" placeholder="Paste JSON here..." />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-2 flex h-9 shrink-0 items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">JSON Schema</p>
            {schema && <CopyButton value={schema} size="sm" />}
          </div>
          <div className="min-h-[400px] flex-1">
            <CodeEditor value={schema} onChange={onSchemaChange} language="json" placeholder="Paste JSON Schema..." />
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center">
        <Button onClick={onValidateSchema} disabled={validating}>
          {validating ? 'Validating...' : 'Validate against Schema'}
        </Button>
      </div>
      {validationResult && (
        <div
          className={`rounded-md border p-4 ${
            validationResult.valid
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
              : 'border-destructive bg-red-50 dark:bg-red-950/20'
          }`}
        >
          <p
            className={`text-sm font-medium ${
              validationResult.valid
                ? 'text-green-700 dark:text-green-400'
                : 'text-destructive'
            }`}
          >
            {validationResult.valid
              ? 'Valid -- JSON matches the schema'
              : `Invalid -- ${validationResult.errors.length} error(s) found`}
          </p>
          {validationResult.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {validationResult.errors.map((item, index) => (
                <li key={index} className="text-xs text-destructive">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
