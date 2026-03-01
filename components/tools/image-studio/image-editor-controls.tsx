'use client';

import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { FormatSelector } from '@/components/shared/format-selector';

const FORMAT_OPTIONS = [
  { id: 'png', label: 'PNG' },
  { id: 'jpg', label: 'JPG' },
  { id: 'webp', label: 'WebP' },
  { id: 'bmp', label: 'BMP' },
  { id: 'gif', label: 'GIF' },
];

interface ImageEditorControlsProps {
  width: number;
  height: number;
  originalDims: { width: number; height: number };
  lockAspect: boolean;
  quality: number;
  format: string;
  estimatedSize: string | null;
  widthError?: string;
  heightError?: string;
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  onToggleLock: () => void;
  onQualityChange: (q: number) => void;
  onFormatChange: (f: string) => void;
}

export { FORMAT_OPTIONS };

export function ImageEditorControls({
  width,
  height,
  originalDims,
  lockAspect,
  quality,
  format,
  estimatedSize,
  widthError,
  heightError,
  onWidthChange,
  onHeightChange,
  onToggleLock,
  onQualityChange,
  onFormatChange,
}: ImageEditorControlsProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Dimensions
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={width}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            className="w-24"
            error={widthError}
          />
          <span className="text-xs text-muted-foreground">×</span>
          <Input
            type="number"
            value={height}
            onChange={(e) => onHeightChange(Number(e.target.value))}
            className="w-24"
            error={heightError}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleLock}
            aria-label={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            {lockAspect ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Original: {originalDims.width}×{originalDims.height}
        </p>
      </div>

      {['jpg', 'webp'].includes(format) && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Quality: {quality}%
          </p>
          <Slider
            min={1}
            max={100}
            step={1}
            value={[quality]}
            onValueChange={([v]) => onQualityChange(v)}
          />
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Output Format
        </p>
        <FormatSelector
          value={format}
          onChange={onFormatChange}
          formats={FORMAT_OPTIONS}
        />
      </div>

      {estimatedSize && (
        <p className="text-xs text-muted-foreground">
          Output size: {estimatedSize}
        </p>
      )}
    </div>
  );
}
