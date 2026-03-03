'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { DownloadMode } from '@/lib/pdf/split-download';

interface DownloadControlsProps {
  downloadMode: DownloadMode;
  onDownload: () => void;
  onModeChange: (mode: DownloadMode) => void;
  onReset: () => void;
  onScaleChange: (scale: number) => void;
  scale: number;
  selectedCount: number;
  status: string;
}

export function DownloadControls({
  downloadMode,
  onDownload,
  onModeChange,
  onReset,
  onScaleChange,
  scale,
  selectedCount,
  status,
}: DownloadControlsProps) {
  return (
    <div className="sticky bottom-6 z-10 mt-8 flex flex-col gap-4 rounded-xl border bg-background/95 p-4 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex-1">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Download as</p>
        <div className="flex flex-wrap items-end gap-4">
          <ToggleGroup
            type="single"
            value={downloadMode}
            onValueChange={(value) => value && onModeChange(value as DownloadMode)}
          >
            <ToggleGroupItem value="pdf">Merged PDF</ToggleGroupItem>
            <ToggleGroupItem value="png">PNG Images</ToggleGroupItem>
          </ToggleGroup>

          {downloadMode === 'png' && (
            <div className="min-w-[120px] max-w-[160px] flex-1">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Scale: {scale}x
              </p>
              <Slider
                min={1}
                max={4}
                step={0.5}
                value={[scale]}
                onValueChange={([value]) => onScaleChange(value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto">
        {status === 'processing' && (
          <Progress value={undefined} label="Processing PDF" className="h-2" />
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onReset} className="flex-1 sm:flex-none">
            New PDF
          </Button>
          <Button
            onClick={onDownload}
            disabled={status === 'processing' || selectedCount === 0}
            loading={status === 'processing'}
            className="flex-1 sm:flex-none"
          >
            {downloadMode === 'png' ? 'Convert & Download' : 'Split & Download'}
          </Button>
        </div>
      </div>
    </div>
  );
}