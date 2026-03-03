'use client';

import { createContext, type ReactNode, useContext } from 'react';
import { Download, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { type BatchItem, type Operation, type OutputFormat } from '@/lib/image/batch-image';

interface BatchControlsContextValue {
  clearAll: () => void;
  doneCount: number;
  downloadAll: () => void;
  format: OutputFormat;
  height: number;
  items: BatchItem[];
  itemsCount: number;
  operation: Operation;
  processAll: () => void;
  processing: boolean;
  progress: number;
  quality: number;
  removeItem: (id: string) => void;
  setFormat: (value: OutputFormat) => void;
  setHeight: (value: number) => void;
  setOperation: (value: Operation) => void;
  setQuality: (value: number) => void;
  setWidth: (value: number) => void;
  width: number;
}

const BatchControlsContext = createContext<BatchControlsContextValue | null>(null);

export function BatchImageControlsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: BatchControlsContextValue;
}) {
  return (
    <BatchControlsContext.Provider value={value}>
      {children}
    </BatchControlsContext.Provider>
  );
}

export function useBatchImageControlsContext(): BatchControlsContextValue {
  const context = useContext(BatchControlsContext);
  if (!context) {
    throw new Error('useBatchImageControlsContext must be used within BatchImageControlsProvider');
  }
  return context;
}

export function BatchControls() {
  const {
    clearAll,
    doneCount,
    downloadAll,
    format,
    height,
    itemsCount,
    operation,
    processAll,
    processing,
    progress,
    quality,
    setFormat,
    setHeight,
    setOperation,
    setQuality,
    setWidth,
    width,
  } = useBatchImageControlsContext();

  return (
    <>
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-36">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Operation</label>
          <Select value={operation} onValueChange={(value) => setOperation(value as Operation)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resize">Resize</SelectItem>
              <SelectItem value="convert">Convert</SelectItem>
              <SelectItem value="compress">Compress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {operation === 'resize' && (
          <>
            <div className="w-28">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Width</label>
              <Input type="number" min={0} value={width} onChange={(event) => setWidth(+event.target.value)} />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Height</label>
              <Input type="number" min={0} value={height} onChange={(event) => setHeight(+event.target.value)} placeholder="Auto" />
            </div>
          </>
        )}

        {(operation === 'convert' || operation === 'compress') && (
          <div className="w-28">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Format</label>
            <Select value={format} onValueChange={(value) => setFormat(value as OutputFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {operation === 'compress' && (
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Quality: {quality}%</label>
            <Slider min={10} max={100} step={5} value={[quality]} onValueChange={([value]) => setQuality(value)} />
          </div>
        )}
      </div>

      {processing && (
        <div className="space-y-1">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">{doneCount} / {itemsCount} processed</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={processAll} disabled={processing}>
          {processing ? 'Processing...' : `Process ${itemsCount} images`}
        </Button>
        {doneCount > 0 && (
          <Button variant="outline" onClick={downloadAll}>
            <Download className="mr-1.5 h-4 w-4" />
            Download {doneCount === 1 ? '' : 'ZIP'}
          </Button>
        )}
        <Button variant="ghost" onClick={clearAll} disabled={processing}>
          <Trash2 className="mr-1.5 h-4 w-4" />
          Clear
        </Button>
      </div>
    </>
  );
}
