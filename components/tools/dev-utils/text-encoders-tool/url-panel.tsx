'use client';

import { useMemo, useState } from 'react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToolParams } from '@/hooks/use-tool-params';
import {
  convertUrl,
  type EncodeDecodeMode,
  INVALID_INPUT_MESSAGE,
} from '@/lib/dev-utils/text-encoders';

export function UrlPanel() {
  const [params, setParams] = useToolParams({ urlMode: 'encode' });
  const [input, setInput] = useState('');
  const mode: EncodeDecodeMode = params.urlMode === 'decode' ? 'decode' : 'encode';

  const output = useMemo(() => convertUrl(input, mode), [input, mode]);

  return (
    <>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => {
            if (value) {
              setParams({ urlMode: value });
            }
          }}
        >
          <ToggleGroupItem value="encode">Encode</ToggleGroupItem>
          <ToggleGroupItem value="decode">Decode</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Input</p>
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={10}
            className="font-mono text-sm"
            placeholder={
              mode === 'encode'
                ? 'Paste URL or text to encode...'
                : 'Paste encoded string to decode...'
            }
            autoFocus
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              {mode === 'encode' ? 'Encoded' : 'Decoded'}
            </p>
            {output && output !== INVALID_INPUT_MESSAGE && <CopyButton value={output} size="sm" />}
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
