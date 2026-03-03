'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { CompressFormat } from '@/lib/image/image-editor';
import { formatBytes } from '@/lib/utils';

import { useImageEditorContext } from './context';

export function CompressModeView() {
  const {
    compressedBlob,
    compressedUrl,
    compressFormat,
    compressQuality,
    compressing,
    file,
    handleCompress,
    handleCompressDownload,
    handleReset,
    setCompressFormat,
    setCompressQuality,
    originalUrl,
  } = useImageEditorContext();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Original ({formatBytes(file.size)})</p>
          {originalUrl && (
            <Image
              src={originalUrl}
              alt="Original"
              width={900}
              height={700}
              unoptimized
              className="w-full rounded-md border border-border object-contain"
            />
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
            <Image
              src={compressedUrl}
              alt="Compressed"
              width={900}
              height={700}
              unoptimized
              className="w-full rounded-md border border-border object-contain"
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        {compressFormat !== 'png' && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Quality: {compressQuality}%</p>
            <Slider
              min={1}
              max={100}
              step={1}
              value={[compressQuality]}
              onValueChange={([value]) => setCompressQuality(value)}
            />
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Format</p>
          <Select value={compressFormat} onValueChange={(value) => setCompressFormat(value as CompressFormat)}>
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
            <Button variant="ghost" onClick={handleReset} className="flex-1">
              Reset
            </Button>
          </div>
          {compressedBlob && (
            <Button variant="outline" onClick={handleCompressDownload} className="w-full">
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
