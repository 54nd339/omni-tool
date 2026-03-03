'use client';

import { Lock, Unlock } from 'lucide-react';

import { FormatSelector } from '@/components/shared/format-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { IMAGE_EDITOR_FORMAT_OPTIONS } from '@/lib/constants/image-studio';

interface ImageEditorControlsProps {
  actions: {
    onFormatChange: (value: string) => void;
    onHeightChange: (height: number) => void;
    onQualityChange: (quality: number) => void;
    onToggleLock: () => void;
    onWidthChange: (width: number) => void;
  };
  state: {
    estimatedSize: string | null;
    format: string;
    height: number;
    heightError?: string;
    lockAspect: boolean;
    originalDims: { width: number; height: number };
    quality: number;
    width: number;
    widthError?: string;
  };
}

export function ImageEditorControls({
  actions,
  state,
}: ImageEditorControlsProps) {
  const {
    estimatedSize,
    format,
    height,
    heightError,
    lockAspect,
    originalDims,
    quality,
    width,
    widthError,
  } = state;

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
            onChange={(e) => actions.onWidthChange(Number(e.target.value))}
            className="w-24"
            error={widthError}
          />
          <span className="text-xs text-muted-foreground">×</span>
          <Input
            type="number"
            value={height}
            onChange={(e) => actions.onHeightChange(Number(e.target.value))}
            className="w-24"
            error={heightError}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={actions.onToggleLock}
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
            onValueChange={([v]) => actions.onQualityChange(v)}
          />
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Output Format
        </p>
        <FormatSelector
          value={format}
          onChange={actions.onFormatChange}
          formats={IMAGE_EDITOR_FORMAT_OPTIONS}
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
