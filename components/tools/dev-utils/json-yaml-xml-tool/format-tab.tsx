'use client';

import { CodeEditor } from '@/components/shared/code-editor';
import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { SendToButton } from '@/components/shared/tool-actions/send-to-button';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  type CsvDelimiter,
  JSON_YAML_XML_FORMATS,
  type ParsedJsonState,
} from '@/lib/dev-utils/json-yaml-xml';
import { pluralize } from '@/lib/utils';
import type { DataFormat } from '@/types/common';

import { TreeNode } from './tree-node';

interface FormatTabProps {
  actions: {
    onConvert: () => void;
    onCsvDelimiterChange: (value: CsvDelimiter) => void;
    onCsvHeadersChange: (value: boolean) => void;
    onFormat: () => void;
    onInputChange: (value: string) => void;
    onJsonPathChange: (value: string) => void;
    onTargetFormatChange: (value: DataFormat) => void;
    onViewModeChange: (value: 'text' | 'tree') => void;
  };
  state: {
    csvDelimiter: CsvDelimiter;
    csvHeaders: boolean;
    error: string | null;
    format: DataFormat;
    input: string;
    isCsvMode: boolean;
    isJsonFormat: boolean;
    jsonPath: string;
    output: string;
    parsedJson: ParsedJsonState;
    pathResults: unknown[] | null;
    targetFormat: DataFormat;
    viewMode: 'text' | 'tree';
  };
}

export function FormatTab({
  actions,
  state,
}: FormatTabProps) {
  const {
    csvDelimiter,
    csvHeaders,
    error,
    format,
    input,
    isCsvMode,
    isJsonFormat,
    jsonPath,
    output,
    parsedJson,
    pathResults,
    targetFormat,
    viewMode,
  } = state;

  return (
    <>
      {isJsonFormat && (
        <div className="flex justify-end">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && actions.onViewModeChange(value as 'text' | 'tree')}
          >
            <ToggleGroupItem value="text">Text</ToggleGroupItem>
            <ToggleGroupItem value="tree">Tree</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <div className="mb-2 flex h-9 shrink-0 items-center">
            <p className="text-xs font-medium text-muted-foreground">Input</p>
          </div>
          <div className="min-h-[400px] flex-1">
            <CodeEditor
              value={input}
              onChange={actions.onInputChange}
              language={format}
              placeholder="Paste JSON, YAML, XML, or CSV..."
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-2 flex h-9 shrink-0 items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">Output</p>
          </div>
          {viewMode === 'text' ? (
            <div className="min-h-[400px] flex-1">
              <CodeEditor
                value={output}
                language={targetFormat}
                readOnly
                placeholder="Formatted output appears here..."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {parsedJson.ok ? (
                <>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">JSONPath Query</p>
                    <Input
                      value={jsonPath}
                      onChange={(event) => actions.onJsonPathChange(event.target.value)}
                      placeholder="$.store.book[0].title"
                      className="font-mono"
                    />
                    {pathResults && pathResults.length > 0 && (
                      <div className="mt-2 rounded-md border border-border bg-muted/50 p-3">
                        <p className="mb-1 text-xs text-muted-foreground">
                          {pathResults.length} {pluralize(pathResults.length, 'match', 'matches')}
                        </p>
                        {pathResults.map((result, index) => (
                          <pre key={index} className="whitespace-pre-wrap text-xs">
                            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                          </pre>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Tree</p>
                    <div className="max-h-[500px] overflow-auto rounded-md border border-border p-3">
                      <TreeNode label="$" value={parsedJson.data} depth={0} highlighted={false} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-[400px] items-center justify-center rounded-md border border-border bg-muted/30">
                  {input.trim() ? (
                    <p className="text-sm text-destructive">{parsedJson.error}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Paste JSON to view tree</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {error && viewMode === 'text' && <p className="text-sm text-red-500">{error}</p>}
      {viewMode === 'text' && (
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border border-border bg-muted/10 p-3 pt-4">
          <Button onClick={actions.onFormat}>Validate &amp; Format</Button>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <p className="mb-1 text-center text-xs text-muted-foreground">Convert to</p>
              <ToggleGroup
                type="single"
                value={targetFormat}
                onValueChange={(value) => value && actions.onTargetFormatChange(value as DataFormat)}
              >
                {JSON_YAML_XML_FORMATS.map((item) => (
                  <ToggleGroupItem key={item} value={item}>
                    {item.toUpperCase()}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <Button variant="outline" onClick={actions.onConvert}>
              Convert
            </Button>
          </div>
          {output && (
            <div className="flex flex-1 items-center justify-end gap-3 sm:flex-none">
              <SendToButton value={output} outputType={isJsonFormat ? 'json' : 'text'} />
              <CopyButton value={output} />
            </div>
          )}
          {isCsvMode && (
            <div className="mt-1 flex w-full items-center justify-between gap-4 border-t border-border pt-3">
              <div>
                <ToggleGroup
                  type="single"
                  value={csvDelimiter}
                  onValueChange={(value) => value && actions.onCsvDelimiterChange(value as CsvDelimiter)}
                >
                  <ToggleGroupItem value=",">Comma</ToggleGroupItem>
                  <ToggleGroupItem value=";">Semicolon</ToggleGroupItem>
                  <ToggleGroupItem value={'\t'}>Tab</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox checked={csvHeaders} onCheckedChange={(value) => actions.onCsvHeadersChange(value === true)} />
                First row is header
              </label>
            </div>
          )}
        </div>
      )}
    </>
  );
}
