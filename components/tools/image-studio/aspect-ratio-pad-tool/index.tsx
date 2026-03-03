'use client';

import Image from 'next/image';
import { Ratio as RatioIcon } from 'lucide-react';

import { BeforeAfterSlider } from '@/components/shared/before-after-slider';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { ShareButton } from '@/components/shared/tool-actions/share-button';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAspectRatioPad } from '@/hooks/use-aspect-ratio-pad';

import { PadSettings } from './pad-settings';
import { RatioCalculator } from './ratio-calculator';

export function AspectRatioPadTool() {
  const {
    calcExpanded,
    calcHeight,
    calcRatio,
    calcResultText,
    calcWidth,
    colorMode,
    customColor,
    file,
    handleCalcHeightChange,
    handleCalcPreset,
    handleCalcWidthChange,
    handleDownload,
    handleFiles,
    handlePad,
    handleReset,
    inputUrl,
    isProcessing,
    padDims,
    paddedFileName,
    resultBlob,
    resultUrl,
    selectedRatio,
    setCalcExpanded,
    setColorMode,
    setCustomColor,
    setSelectedRatio,
  } = useAspectRatioPad();

  return (
    <div className="space-y-6">
      <RatioCalculator
        calcExpanded={calcExpanded}
        calcHeight={calcHeight}
        calcRatio={calcRatio}
        calcResultText={calcResultText}
        calcWidth={calcWidth}
        onCalcHeightChange={handleCalcHeightChange}
        onCalcPreset={handleCalcPreset}
        onCalcWidthChange={handleCalcWidthChange}
        onToggleExpanded={() => setCalcExpanded((expanded) => !expanded)}
      />

      {!file && (
        <EmptyState icon={RatioIcon} title="Pad to aspect ratio" description="Upload an image to pad it to your chosen ratio" hint="Tip: ⌘V to paste an image from clipboard">
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            label="Drop an image to pad"
            hint="PNG, JPG, or WebP -- or paste from clipboard"
          />
        </EmptyState>
      )}

      {file && (
        <>
          <PadSettings
            colorMode={colorMode}
            customColor={customColor}
            padDims={padDims}
            selectedRatio={selectedRatio}
            onColorModeChange={setColorMode}
            onCustomColorChange={setCustomColor}
            onRatioChange={setSelectedRatio}
          />

          {isProcessing && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Padding image...</p>
              <Progress value={100} className="animate-pulse" />
            </div>
          )}

          {(resultUrl || inputUrl) && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
              {resultUrl && inputUrl ? (
                <div className="overflow-hidden rounded-lg bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3C%2Fsvg%3E')]">
                  <BeforeAfterSlider
                    beforeSrc={inputUrl}
                    afterSrc={resultUrl}
                    beforeLabel="Original"
                    afterLabel="Padded"
                    className="max-h-[400px] w-full"
                  />
                </div>
              ) : inputUrl ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <Image src={inputUrl} alt="Original" width={1200} height={800} unoptimized className="max-h-[400px] w-full object-contain" />
                </div>
              ) : null}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handlePad} disabled={isProcessing} loading={isProcessing}>
              {resultBlob ? 'Re-pad' : 'Pad Image'}
            </Button>
            {resultBlob && (
              <>
                <Button variant="outline" onClick={handleDownload}>
                  Download
                </Button>
                <ShareButton blob={resultBlob} fileName={paddedFileName} />
              </>
            )}
            <Button variant="ghost" onClick={handleReset}>
              New image
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
