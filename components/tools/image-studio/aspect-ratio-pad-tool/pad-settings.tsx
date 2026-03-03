'use client';

import { memo } from 'react';

import { ColorPicker } from '@/components/ui/color-picker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ASPECT_RATIOS, PAD_COLORS } from '@/lib/constants/image-studio';
import { cn } from '@/lib/utils';
import type { AspectRatio } from '@/types/common';

const RatioButton = memo(function RatioButton({
  ratio,
  selected,
  onSelect,
}: {
  ratio: AspectRatio;
  selected: boolean;
  onSelect: (ratio: AspectRatio) => void;
}) {
  return (
    <button
      onClick={() => onSelect(ratio)}
      className={cn(
        'rounded-md border px-3 py-2 text-left text-xs transition-colors',
        selected
          ? 'border-foreground bg-muted font-medium'
          : 'border-border hover:bg-muted/50',
      )}
    >
      <div className="font-medium">{ratio.label}</div>
      <div className="text-muted-foreground">{ratio.hint}</div>
    </button>
  );
});

interface PadSettingsProps {
  colorMode: string;
  customColor: string;
  padDims: { targetWidth: number; targetHeight: number } | null;
  selectedRatio: AspectRatio;
  onColorModeChange: (value: string) => void;
  onCustomColorChange: (value: string) => void;
  onRatioChange: (ratio: AspectRatio) => void;
}

export function PadSettings({
  colorMode,
  customColor,
  padDims,
  selectedRatio,
  onColorModeChange,
  onCustomColorChange,
  onRatioChange,
}: PadSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Aspect Ratio</p>
        <div className="grid grid-cols-4 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <RatioButton
              key={ratio.id}
              ratio={ratio}
              selected={selectedRatio.id === ratio.id}
              onSelect={onRatioChange}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Fill Color</p>
        <div className="flex items-center gap-3">
          <ToggleGroup type="single" value={colorMode} onValueChange={(value) => value && onColorModeChange(value)}>
            {PAD_COLORS.map((color) => (
              <ToggleGroupItem key={color.id} value={color.id}>
                {color.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {colorMode === 'custom' && <ColorPicker value={customColor} onChange={onCustomColorChange} />}
        </div>
      </div>

      {padDims && (
        <p className="text-xs text-muted-foreground">
          Output: {padDims.targetWidth}×{padDims.targetHeight}px
        </p>
      )}
    </div>
  );
}
