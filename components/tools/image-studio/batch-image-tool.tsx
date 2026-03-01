'use client';

import { useCallback, useRef, useState } from 'react';
import { Download, Images, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { EmptyState } from '@/components/shared/empty-state';

type Operation = 'resize' | 'convert' | 'compress';
type OutputFormat = 'png' | 'jpg' | 'webp';

interface BatchItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: Blob;
  error?: string;
}

const ACCEPT = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.bmp', '.gif'] };

function createPreview(file: File): string {
  return URL.createObjectURL(file);
}

async function processImage(
  file: File,
  op: Operation,
  width: number,
  height: number,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const srcW = bitmap.width;
  const srcH = bitmap.height;

  let outW = srcW;
  let outH = srcH;

  if (op === 'resize' && width > 0 && height > 0) {
    outW = width;
    outH = height;
  } else if (op === 'resize' && width > 0) {
    outW = width;
    outH = Math.round((srcH / srcW) * width);
  } else if (op === 'resize' && height > 0) {
    outH = height;
    outW = Math.round((srcW / srcH) * height);
  }

  const canvas = new OffscreenCanvas(outW, outH);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, outW, outH);
  bitmap.close();

  const mimeMap: Record<OutputFormat, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    webp: 'image/webp',
  };

  const outFormat = op === 'convert' || op === 'compress' ? format : 'png';
  const mime = mimeMap[outFormat];
  const q = op === 'compress' ? quality / 100 : 0.92;

  return canvas.convertToBlob({ type: mime, quality: q });
}

export function BatchImageTool() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [operation, setOperation] = useState<Operation>('resize');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(0);
  const [format, setFormat] = useState<OutputFormat>('webp');
  const [quality, setQuality] = useState(80);
  const [processing, setProcessing] = useState(false);
  const abortRef = useRef(false);

  const handleFiles = useCallback((files: File[]) => {
    const newItems: BatchItem[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      file,
      preview: createPreview(file),
      status: 'pending' as const,
    }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    items.forEach((i) => URL.revokeObjectURL(i.preview));
    setItems([]);
  }, [items]);

  const processAll = useCallback(async () => {
    if (items.length === 0) return;
    setProcessing(true);
    abortRef.current = false;

    const CONCURRENCY = 4;
    let idx = 0;

    const runNext = async (): Promise<void> => {
      while (idx < items.length) {
        if (abortRef.current) return;
        const currentIdx = idx++;
        const item = items[currentIdx];

        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'processing' } : i)),
        );

        try {
          const result = await processImage(item.file, operation, width, height, format, quality);
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'done', result } : i)),
          );
        } catch (err) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: 'error', error: err instanceof Error ? err.message : 'Failed' }
                : i,
            ),
          );
        }
      }
    };

    const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => runNext());
    await Promise.all(workers);
    setProcessing(false);
    if (!abortRef.current) toast.success(`Processed ${items.length} images`);
  }, [items, operation, width, height, format, quality]);

  const downloadAll = useCallback(async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.result);
    if (doneItems.length === 0) return;

    if (doneItems.length === 1) {
      const item = doneItems[0];
      const ext = format === 'jpg' ? 'jpg' : format;
      const url = URL.createObjectURL(item.result!);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.file.name.replace(/\.[^.]+$/, `.${ext}`);
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const zip = new JSZip();
    for (const item of doneItems) {
      const ext = operation === 'resize' ? 'png' : format;
      const name = item.file.name.replace(/\.[^.]+$/, `.${ext}`);
      zip.file(name, item.result!);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch-images.zip';
    a.click();
    URL.revokeObjectURL(url);
  }, [items, format, operation]);

  const doneCount = items.filter((i) => i.status === 'done').length;
  const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <FileDropzone
          onFiles={handleFiles}
          accept={ACCEPT}
          multiple
          maxFiles={50}
          label="Drop images here or click to browse"
          hint="JPEG, PNG, WebP, AVIF, BMP, GIF — up to 50 images"
        />
        <EmptyState
          icon={Images}
          title="Batch Image Processing"
          description="Drop multiple images, apply the same operation to all, and download as ZIP."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileDropzone
        onFiles={handleFiles}
        accept={ACCEPT}
        multiple
        maxFiles={50}
        label="Add more images"
        className="min-h-[80px] sm:min-h-[100px]"
      />

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-36">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Operation</label>
          <Select value={operation} onValueChange={(v) => setOperation(v as Operation)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Input type="number" min={0} value={width} onChange={(e) => setWidth(+e.target.value)} />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Height</label>
              <Input type="number" min={0} value={height} onChange={(e) => setHeight(+e.target.value)} placeholder="Auto" />
            </div>
          </>
        )}

        {(operation === 'convert' || operation === 'compress') && (
          <div className="w-28">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Format</label>
            <Select value={format} onValueChange={(v) => setFormat(v as OutputFormat)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Quality: {quality}%
            </label>
            <Slider min={10} max={100} step={5} value={[quality]} onValueChange={([v]) => setQuality(v)} />
          </div>
        )}
      </div>

      {processing && (
        <div className="space-y-1">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">{doneCount} / {items.length} processed</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={processAll} disabled={processing}>
          {processing ? 'Processing...' : `Process ${items.length} images`}
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

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {items.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-md border border-border">
            <img
              src={item.preview}
              alt={item.file.name}
              className="aspect-square w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => removeItem(item.id)}
                className="rounded-full bg-background/90 p-1.5"
                aria-label={`Remove ${item.file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            {item.status === 'processing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
              </div>
            )}
            {item.status === 'done' && (
              <div className="absolute bottom-1 right-1 rounded-full bg-green-500 p-0.5">
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {item.status === 'error' && (
              <div className="absolute bottom-1 right-1 rounded-full bg-destructive p-0.5">
                <X className="h-2.5 w-2.5 text-white" />
              </div>
            )}
            <p className="truncate px-1 py-0.5 text-[10px] text-muted-foreground">{item.file.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
