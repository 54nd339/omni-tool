'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CALC_PRESETS } from '@/lib/image/aspect-ratio-pad';

interface RatioCalculatorProps {
  calcExpanded: boolean;
  calcHeight: string;
  calcRatio: { w: number; h: number; decimal: string } | null;
  calcResultText: string;
  calcWidth: string;
  onCalcHeightChange: (value: string) => void;
  onCalcPreset: (presetW: number, presetH: number, ratioId: string | null) => void;
  onCalcWidthChange: (value: string) => void;
  onToggleExpanded: () => void;
}

export function RatioCalculator({
  calcExpanded,
  calcHeight,
  calcRatio,
  calcResultText,
  calcWidth,
  onCalcHeightChange,
  onCalcPreset,
  onCalcWidthChange,
  onToggleExpanded,
}: RatioCalculatorProps) {
  const width = parseFloat(calcWidth);
  const height = parseFloat(calcHeight);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <button
        type="button"
        onClick={onToggleExpanded}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50"
      >
        <span>Aspect Ratio Calculator</span>
        {calcExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {calcExpanded && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Presets</p>
            <div className="flex flex-wrap gap-2">
              {CALC_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => onCalcPreset(preset.w, preset.h, preset.ratioId)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Width</p>
              <Input
                value={calcWidth}
                onChange={(event) => onCalcWidthChange(event.target.value)}
                type="number"
                className="font-mono"
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Height</p>
              <Input
                value={calcHeight}
                onChange={(event) => onCalcHeightChange(event.target.value)}
                type="number"
                className="font-mono"
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Ratio</p>
              <div className="flex items-center gap-2">
                <Input value={calcResultText} readOnly className="font-mono" />
                {calcResultText && <CopyButton value={calcResultText} />}
              </div>
            </div>
          </div>

          {calcRatio && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {calcWidth} × {calcHeight} = <strong>{calcRatio.w}:{calcRatio.h}</strong> ({calcRatio.decimal})
              </p>
              <div
                className="rounded-md border-2 border-foreground/20"
                style={{
                  width: Math.min(300, (width / Math.max(width, height)) * 300),
                  height: Math.min(300, (height / Math.max(width, height)) * 300),
                  minWidth: 40,
                  minHeight: 40,
                }}
              />
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Scale to width</p>
                <div className="flex gap-2">
                  {[640, 1280, 1920, 2560, 3840].map((targetWidth) => (
                    <Button key={targetWidth} variant="outline" size="sm" onClick={() => onCalcWidthChange(String(targetWidth))}>
                      {targetWidth}px
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Scale to height</p>
                <div className="flex gap-2">
                  {[360, 480, 720, 1080, 2160].map((targetHeight) => (
                    <Button key={targetHeight} variant="outline" size="sm" onClick={() => onCalcHeightChange(String(targetHeight))}>
                      {targetHeight}px
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
