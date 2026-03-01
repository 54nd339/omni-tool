'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SlidersHorizontal } from 'lucide-react';
import { useQueryState, parseAsInteger, parseAsBoolean, parseAsString } from 'nuqs';
import { useFFmpeg, useClipboardPaste, useDownload, useShare } from '@/hooks';
import { formatBytes } from '@/lib/utils';
import { useHistoryStore, useCanUndo, useCanRedo } from '@/stores/history-store';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageEditorControls } from './image-editor-controls';
import { ImageEditorActions } from './image-editor-actions';

type EditorMode = 'edit' | 'compress';
type CompressFormat = 'jpeg' | 'webp' | 'png';

interface EditorSnapshot {
  width: number;
  height: number;
  quality: number;
  format: string;
  previewUrl: string | null;
  resultBlob: Blob | null;
}

export function ImageEditorTool() {
  const { run, status, progress } = useFFmpeg();
  const { download } = useDownload();
  const { share } = useShare();
  const { push, undo, redo, clear } = useHistoryStore();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const [mode, setMode] = useState<EditorMode>('edit');
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState({ width: 0, height: 0 });

  const [width, setWidth] = useQueryState('w', parseAsInteger.withDefault(0));
  const [height, setHeight] = useQueryState('h', parseAsInteger.withDefault(0));
  const [lockAspect, setLockAspect] = useQueryState('lock', parseAsBoolean.withDefault(true));
  const [quality, setQuality] = useQueryState('q', parseAsInteger.withDefault(85));
  const [format, setFormat] = useQueryState('f', parseAsString.withDefault('png'));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const [compressQuality, setCompressQuality] = useState(80);
  const [compressFormat, setCompressFormat] = useState<CompressFormat>('webp');
  const [compressing, setCompressing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  const restoreSnapshot = useCallback((snap: EditorSnapshot) => {
    setWidth(snap.width);
    setHeight(snap.height);
    setQuality(snap.quality);
    setFormat(snap.format);
    setPreviewUrl(snap.previewUrl);
    setResultBlob(snap.resultBlob);
  }, []);

  const handleUndo = useCallback(() => {
    const snap = undo();
    if (snap) restoreSnapshot(snap.data as EditorSnapshot);
  }, [undo, restoreSnapshot]);

  const handleRedo = useCallback(() => {
    const snap = redo();
    if (snap) restoreSnapshot(snap.data as EditorSnapshot);
  }, [redo, restoreSnapshot]);

  const handleFiles = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResultBlob(null);
    setCompressedBlob(null);
    setCompressedUrl(null);

    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setOriginalDims({ width: img.width, height: img.height });
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = url;
  }, []);

  useClipboardPaste(handleFiles, !file);

  const handleModeChange = useCallback(
    (v: string) => {
      if (!v) return;
      setMode(v as EditorMode);
      setResultBlob(null);
      setCompressedBlob(null);
      setCompressedUrl(null);
      if (originalUrl) setPreviewUrl(originalUrl);
    },
    [originalUrl],
  );

  const handleWidthChange = useCallback(
    (w: number) => {
      setWidth(w);
      if (lockAspect && originalDims.width > 0) {
        setHeight(Math.round((w / originalDims.width) * originalDims.height));
      }
    },
    [lockAspect, originalDims],
  );

  const handleHeightChange = useCallback(
    (h: number) => {
      setHeight(h);
      if (lockAspect && originalDims.height > 0) {
        setWidth(Math.round((h / originalDims.height) * originalDims.width));
      }
    },
    [lockAspect, originalDims],
  );

  const widthError = file && width <= 0 ? 'Must be > 0' : undefined;
  const heightError = file && height <= 0 ? 'Must be > 0' : undefined;
  const dimsValid = width > 0 && height > 0;

  const handleProcess = useCallback(async () => {
    if (!file || !dimsValid) {
      if (!dimsValid) toast.error('Width and height must be positive');
      return;
    }

    try {
      let blob: Blob;
      if (width !== originalDims.width || height !== originalDims.height) {
        blob = await run((api) =>
          api.resizeImage(file, { width, height, maintainAspect: false }),
        );
      } else {
        blob = file;
      }

      if (format !== 'png' || quality < 100) {
        blob = await run((api) =>
          api.convertImage(blob, { outputFormat: format, quality }),
        );
      }

      const newUrl = URL.createObjectURL(blob);
      setResultBlob(blob);
      setPreviewUrl(newUrl);
      push('Process image', {
        width,
        height,
        quality,
        format,
        previewUrl: newUrl,
        resultBlob: blob,
      } as EditorSnapshot);
      toast.success(
        `Processed: ${formatBytes(file.size)} → ${formatBytes(blob.size)}`,
      );
    } catch {
      toast.error('Processing failed');
    }
  }, [file, width, height, originalDims, format, quality, run, push, dimsValid]);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    setCompressing(true);
    try {
      const img = new Image();
      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });
      img.src = URL.createObjectURL(file);
      await loadPromise;

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      ctx.drawImage(img, 0, 0);

      const mimeType =
        compressFormat === 'jpeg'
          ? 'image/jpeg'
          : compressFormat === 'webp'
            ? 'image/webp'
            : 'image/png';
      const qualityVal =
        compressFormat === 'png' ? undefined : compressQuality / 100;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Compression failed'))),
          mimeType,
          qualityVal,
        );
      });

      URL.revokeObjectURL(img.src);
      const url = URL.createObjectURL(blob);
      setCompressedBlob(blob);
      setCompressedUrl(url);
      toast.success(
        `Compressed: ${formatBytes(file.size)} → ${formatBytes(blob.size)}`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Compression failed');
    } finally {
      setCompressing(false);
    }
  }, [file, compressQuality, compressFormat]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const name = file.name.replace(/\.[^.]+$/, '');
    download(resultBlob, `${name}-edited.${format}`);
  }, [resultBlob, file, format, download]);

  const handleCompressDownload = useCallback(() => {
    if (!compressedBlob || !file) return;
    const ext = compressFormat === 'jpeg' ? 'jpg' : compressFormat;
    const name = file.name.replace(/\.[^.]+$/, `.compressed.${ext}`);
    download(compressedBlob, name);
  }, [compressedBlob, file, compressFormat, download]);

  const handleReset = useCallback(() => {
    setFile(null);
    setOriginalUrl(null);
    setPreviewUrl(null);
    setResultBlob(null);
    setCompressedBlob(null);
    setCompressedUrl(null);
    setMode('edit');
    clear();
  }, [clear]);

  const estimatedSize = resultBlob ? formatBytes(resultBlob.size) : null;

  return (
    <div className="space-y-6">
      {!file && (
        <EmptyState
          icon={SlidersHorizontal}
          title="Edit or compress an image"
          description="Resize, adjust quality, convert format, or quick-compress"
          hint="Tip: ⌘V to paste an image from clipboard"
        >
          <FileDropzone
            onFiles={handleFiles}
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif'],
            }}
            label="Drop an image"
            hint="Resize, convert, compress -- or paste from clipboard"
          />
        </EmptyState>
      )}

      {file && (
        <>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={handleModeChange}
          >
            <ToggleGroupItem value="edit">Resize &amp; Convert</ToggleGroupItem>
            <ToggleGroupItem value="compress">Quick Compress</ToggleGroupItem>
          </ToggleGroup>

          {mode === 'edit' ? (
            <>
              <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-2">
                  <div className="overflow-hidden rounded-lg border border-border">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-[400px] w-full object-contain"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Original: {formatBytes(file.size)}
                    {resultBlob && (
                      <>
                        {' → '}
                        {formatBytes(resultBlob.size)}{' '}
                        <span
                          className={
                            resultBlob.size < file.size
                              ? 'text-green-600'
                              : 'text-destructive'
                          }
                        >
                          (
                          {(
                            (1 - resultBlob.size / file.size) *
                            100
                          ).toFixed(1)}
                          %{' '}
                          {resultBlob.size < file.size ? 'smaller' : 'larger'})
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="space-y-6">
                  <ImageEditorControls
                    width={width}
                    height={height}
                    originalDims={originalDims}
                    lockAspect={lockAspect}
                    quality={quality}
                    format={format}
                    estimatedSize={estimatedSize}
                    widthError={widthError}
                    heightError={heightError}
                    onWidthChange={handleWidthChange}
                    onHeightChange={handleHeightChange}
                    onToggleLock={() => setLockAspect((v) => !v)}
                    onQualityChange={setQuality}
                    onFormatChange={setFormat}
                  />

                  {status === 'processing' && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Processing... {progress}%
                      </p>
                      <Progress value={progress} />
                    </div>
                  )}

                  <ImageEditorActions
                    processing={status === 'processing'}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    hasResult={!!resultBlob}
                    onProcess={handleProcess}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onDownload={handleDownload}
                    onShare={
                      resultBlob && file
                        ? () =>
                          share({
                            blob: resultBlob,
                            fileName: `${file.name.replace(/\.[^.]+$/, '')}-edited.${format}`,
                          })
                        : undefined
                    }
                    onReset={handleReset}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Original ({formatBytes(file.size)})</p>
                    {originalUrl && (
                      <img src={originalUrl} alt="Original" className="w-full rounded-md border border-border object-contain" />
                    )}
                  </div>
                  {compressedBlob && compressedUrl && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Compressed ({formatBytes(compressedBlob.size)}){' '}
                        <span className={compressedBlob.size < file.size ? 'text-green-600' : 'text-destructive'}>
                          ({((1 - compressedBlob.size / file.size) * 100).toFixed(1)}% {compressedBlob.size < file.size ? 'smaller' : 'larger'})
                        </span>
                      </p>
                      <img src={compressedUrl} alt="Compressed" className="w-full rounded-md border border-border object-contain" />
                    </div>
                  )}
                </div>

                <div className="space-y-6">

                  {compressFormat !== 'png' && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Quality: {compressQuality}%</p>
                      <Slider min={1} max={100} step={1} value={[compressQuality]} onValueChange={([v]) => setCompressQuality(v)} />
                    </div>
                  )}

                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Format</p>
                    <Select value={compressFormat} onValueChange={(v) => setCompressFormat(v as CompressFormat)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <div className="flex gap-2">
                      <Button onClick={handleCompress} disabled={compressing} className="flex-1">
                        {compressing ? 'Compressing...' : 'Compress'}
                      </Button>
                      <Button variant="ghost" onClick={handleReset} className="flex-1">Reset</Button>
                    </div>
                    {compressedBlob && (
                      <Button variant="outline" onClick={handleCompressDownload} className="w-full">Download</Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
