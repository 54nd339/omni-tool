'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { FileDropzone } from '@/components/shared/file-dropzone';
import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { SendToButton } from '@/components/shared/tool-actions/send-to-button';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToolParams } from '@/hooks/use-tool-params';
import { convertBase64, type EncodeDecodeMode,fileToBase64 } from '@/lib/dev-utils/text-encoders';

const B64_DEFAULTS = {
  b64_mode: 'encode',
  b64_text: '',
};

interface Base64PanelProps {
  initialPaste: string;
}

export function Base64Panel({ initialPaste }: Base64PanelProps) {
  const initialParams = initialPaste
    ? { b64_mode: 'decode', b64_text: initialPaste }
    : B64_DEFAULTS;

  const [params, setParams] = useToolParams(initialParams);
  const mode = (params.b64_mode === 'decode' ? 'decode' : 'encode') as EncodeDecodeMode;
  const [input, setInput] = useState(params.b64_text);
  const [fileResult, setFileResult] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (input !== params.b64_text) {
        setParams({ b64_text: input });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [input, params.b64_text, setParams]);

  const output = useMemo(() => convertBase64(input, mode), [input, mode]);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setFileResult(base64);
      toast.success(`${file.name} converted to Base64`);
    } catch {
      toast.error('Failed to convert file to Base64');
    }
  }, []);

  return (
    <>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => {
            if (!value) {
              return;
            }

            setInput('');
            setParams({ b64_mode: value, b64_text: '' });
          }}
        >
          <ToggleGroupItem value="encode">Encode</ToggleGroupItem>
          <ToggleGroupItem value="decode">Decode</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {mode === 'encode' ? 'Text' : 'Base64'}
          </p>
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 to decode...'}
            rows={10}
            className="font-mono text-sm"
            autoFocus
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {mode === 'encode' ? 'Base64' : 'Text'}
          </p>
          <Textarea
            value={output}
            readOnly
            rows={10}
            className="font-mono text-sm"
            placeholder="Result appears here..."
          />
        </div>
      </div>

      {output && (
        <div className="flex items-center gap-3">
          <SendToButton value={output} outputType="text" />
          <CopyButton value={output} />
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">File to Base64</p>
        <FileDropzone
          onFiles={handleFiles}
          label="Drop any file to convert to Base64"
          hint="Max 10 MB recommended"
          maxSize={10 * 1024 * 1024}
        />
        {fileResult && (
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">File Base64</p>
              <CopyButton value={fileResult} size="sm" />
            </div>
            <Textarea value={fileResult} readOnly rows={4} className="font-mono text-xs" />
          </div>
        )}
      </div>
    </>
  );
}
