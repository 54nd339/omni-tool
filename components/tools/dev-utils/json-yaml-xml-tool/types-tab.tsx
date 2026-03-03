'use client';

import { CodeEditor } from '@/components/shared/code-editor';
import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { OptionalMode, TsKind } from '@/lib/dev-utils/json-yaml-xml';

interface TypesTabProps {
  input: string;
  tsError: string | null;
  tsKind: TsKind;
  tsOptional: OptionalMode;
  tsOutput: string;
  onGenerateTypes: () => void;
  onInputChange: (value: string) => void;
  onTsKindChange: (value: TsKind) => void;
  onTsOptionalChange: (value: OptionalMode) => void;
}

export function TypesTab({
  input,
  tsError,
  tsKind,
  tsOptional,
  tsOutput,
  onGenerateTypes,
  onInputChange,
  onTsKindChange,
  onTsOptionalChange,
}: TypesTabProps) {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <div className="mb-2 flex h-9 shrink-0 items-center">
            <p className="text-xs font-medium text-muted-foreground">JSON</p>
          </div>
          <div className="min-h-[400px] flex-1">
            <CodeEditor value={input} onChange={onInputChange} language="json" placeholder="Paste JSON here..." />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-2 flex h-9 shrink-0 items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">TypeScript output</p>
            {tsOutput && <CopyButton value={tsOutput} size="sm" />}
          </div>
          <div className="min-h-[400px] flex-1">
            <CodeEditor
              value={tsOutput}
              language="typescript"
              readOnly
              placeholder="Generated types will appear here..."
            />
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-4 rounded-lg border border-border bg-muted/10 p-3 pt-4">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Output style</p>
          <ToggleGroup type="single" value={tsKind} onValueChange={(value) => value && onTsKindChange(value as TsKind)}>
            <ToggleGroupItem value="interface">interface</ToggleGroupItem>
            <ToggleGroupItem value="type">type</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Properties</p>
          <ToggleGroup
            type="single"
            value={tsOptional}
            onValueChange={(value) => value && onTsOptionalChange(value as OptionalMode)}
          >
            <ToggleGroupItem value="required">Required</ToggleGroupItem>
            <ToggleGroupItem value="optional">Optional</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="min-w-[120px] flex-1" />
        <Button onClick={onGenerateTypes}>Generate TypeScript</Button>
      </div>
      {tsError && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">{tsError}</p>
        </div>
      )}
    </>
  );
}
