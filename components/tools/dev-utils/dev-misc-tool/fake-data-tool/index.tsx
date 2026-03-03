'use client';

import { Plus } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFakeDataTool } from '@/hooks/use-fake-data-tool';

import { FieldSchemaRow } from './field-schema-row';

export function FakeDataTool() {
  const {
    addField,
    fields,
    generate,
    output,
    outputFormat,
    recordCount,
    removeField,
    setOutputFormat,
    setRecordCount,
    updateField,
  } = useFakeDataTool();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Schema Settings</p>
            <Button variant="outline" size="sm" onClick={addField}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add field
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field) => (
              <FieldSchemaRow
                key={field.id}
                field={field}
                canRemove={fields.length > 1}
                onRemove={removeField}
                onUpdate={updateField}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-6 rounded-lg border border-border bg-muted/10 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Records (1–1000)
            </label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={recordCount}
              onChange={(e) => setRecordCount(Number(e.target.value) || 1)}
              className="h-9 w-24"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Format</label>
            <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as 'json' | 'csv')}>
              <SelectTrigger className="h-9 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} className="flex-1">Generate</Button>
        </div>
      </div>

      <div className="flex h-full flex-col space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Output Data</p>
          {output && <CopyButton value={output} size="sm" />}
        </div>
        <div className="relative mt-2 min-h-[300px] flex-1 rounded-md border border-border">
          {output ? (
            <Textarea
              readOnly
              value={output}
              className="absolute inset-0 h-full w-full resize-none border-0 font-mono text-sm focus-visible:ring-0"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted/10 text-sm italic text-muted-foreground">
              Click Generate to construct data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
