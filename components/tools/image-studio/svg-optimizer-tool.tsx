'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CopyButton } from '@/components/shared/copy-button';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { formatBytes } from '@/lib/utils';

export function SvgOptimizerTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [precision, setPrecision] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const text = await f.text();
    setInput(text);
    setOutput('');
  }, []);

  const optimize = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const { optimize: svgoOptimize } = await import('svgo/browser');
      const result = svgoOptimize(input, {
        multipass: true,
        floatPrecision: precision,
      });
      setOutput(result.data);
      const saved = new Blob([input]).size - new Blob([result.data]).size;
      toast.success(`Saved ${formatBytes(Math.max(0, saved))}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Optimization failed');
    } finally {
      setLoading(false);
    }
  }, [input, precision]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const inputSize = input ? new Blob([input]).size : 0;
  const outputSize = output ? new Blob([output]).size : 0;

  const inputPreviewUrl = useMemo(
    () => input ? URL.createObjectURL(new Blob([input], { type: 'image/svg+xml' })) : null,
    [input],
  );
  const outputPreviewUrl = useMemo(
    () => output ? URL.createObjectURL(new Blob([output], { type: 'image/svg+xml' })) : null,
    [output],
  );

  return (
    <div className="space-y-6">
      <FileDropzone
        onFiles={handleFiles}
        accept={{ 'image/svg+xml': ['.svg'] }}
        label="Drop an SVG file or click to browse"
        hint="Or paste SVG markup below"
        className="min-h-[100px]"
      />

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Float Precision: {precision}
        </p>
        <Slider min={0} max={8} step={1} value={[precision]} onValueChange={([v]) => setPrecision(v)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Input {inputSize > 0 && `(${formatBytes(inputSize)})`}
          </p>
          <Textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setOutput(''); }}
            placeholder="Paste SVG markup here..."
            rows={12}
            className="font-mono text-xs"
            autoFocus
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Optimized
              {outputSize > 0 && (
                <>
                  {' '}({formatBytes(outputSize)})
                  {inputSize > 0 && (
                    <span className={outputSize < inputSize ? ' text-green-600' : ' text-destructive'}>
                      {' '}({((1 - outputSize / inputSize) * 100).toFixed(1)}% smaller)
                    </span>
                  )}
                </>
              )}
            </p>
            {output && <CopyButton value={output} size="sm" />}
          </div>
          <Textarea
            value={output}
            readOnly
            rows={12}
            className="font-mono text-xs"
            placeholder="Optimized SVG appears here..."
          />
        </div>
      </div>

      {(input || output) && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {inputPreviewUrl && (
              <div className="flex items-center justify-center rounded-md border border-border bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3C%2Fsvg%3E')] p-4">
                <img src={inputPreviewUrl} alt="Input SVG" className="max-h-48 w-full object-contain" />
              </div>
            )}
            {outputPreviewUrl && (
              <div className="flex items-center justify-center rounded-md border border-border bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3C%2Fsvg%3E')] p-4">
                <img src={outputPreviewUrl} alt="Optimized SVG" className="max-h-48 w-full object-contain" />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={optimize} disabled={loading || !input.trim()}>
          {loading ? 'Optimizing...' : 'Optimize'}
        </Button>
        {output && (
          <Button variant="outline" onClick={handleDownload}>
            Download
          </Button>
        )}
      </div>
    </div>
  );
}
