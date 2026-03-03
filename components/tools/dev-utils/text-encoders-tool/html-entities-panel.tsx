'use client';

import { useMemo, useState } from 'react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToolParams } from '@/hooks/use-tool-params';
import { convertHtml, type EncodeDecodeMode } from '@/lib/dev-utils/text-encoders';

export function HtmlEntitiesPanel() {
  const [params, setParams] = useToolParams({ htmlMode: 'encode', htmlNumeric: 'false' });
  const [input, setInput] = useState('');
  const mode: EncodeDecodeMode = params.htmlMode === 'decode' ? 'decode' : 'encode';
  const numeric = params.htmlNumeric === 'true';

  const output = useMemo(() => convertHtml(input, mode, numeric), [input, mode, numeric]);

  return (
    <>
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value) => {
              if (value) {
                setParams({ htmlMode: value });
              }
            }}
          >
            <ToggleGroupItem value="encode">Encode</ToggleGroupItem>
            <ToggleGroupItem value="decode">Decode</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {mode === 'encode' && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Format</p>
            <ToggleGroup
              type="single"
              value={numeric ? 'numeric' : 'named'}
              onValueChange={(value) => {
                if (value) {
                  setParams({ htmlNumeric: value === 'numeric' ? 'true' : 'false' });
                }
              }}
            >
              <ToggleGroupItem value="named">Named</ToggleGroupItem>
              <ToggleGroupItem value="numeric">Numeric</ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Input</p>
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              mode === 'encode'
                ? '<p>Hello & "World"</p>'
                : '&lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt;'
            }
            rows={10}
            className="font-mono text-sm"
            autoFocus
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Output</p>
            {output && <CopyButton value={output} size="sm" />}
          </div>
          <Textarea
            value={output}
            readOnly
            rows={10}
            className="font-mono text-sm"
            placeholder="Result appears here..."
          />
        </div>
      </div>
    </>
  );
}
