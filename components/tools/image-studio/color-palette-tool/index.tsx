'use client';

import { useCallback, useState } from 'react';
import { Pipette } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { useClipboardPaste } from '@/hooks/use-clipboard-paste';
import { useToolParams } from '@/hooks/use-tool-params';
import { useColorPalette } from '@/hooks/worker-hooks';
import {
  type ColorInfo,
  type ExportFormat,
  type HarmonyType,
} from '@/lib/image/color-palette';

import { ExtractedPaletteSection } from './extracted-palette-section';
import { HarmonySection } from './harmony-section';

export function ColorPaletteTool() {
  const [params, setParams] = useToolParams({
    baseHex: '#3b82f6',
    exportFormat: 'json',
    harmony: 'triadic',
  });
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const { extractDominantColors, status } = useColorPalette();

  const baseHex = params.baseHex;
  const harmony = params.harmony as HarmonyType;
  const exportFormat = params.exportFormat as ExportFormat;

  const handleFiles = useCallback((files: File[]) => {
    const fileValue = files[0];
    if (!fileValue) return;

    if (imageUrl) URL.revokeObjectURL(imageUrl);

    setFile(fileValue);
    const url = URL.createObjectURL(fileValue);
    setImageUrl(url);

    extractDominantColors(fileValue)
      .then(setColors)
      .catch(() => setColors([]));
  }, [extractDominantColors, imageUrl]);

  const handleReset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl(null);
    setColors([]);
  }, [imageUrl]);

  useClipboardPaste(handleFiles, !file);

  const loading = status === 'loading' || status === 'processing';

  return (
    <div className="space-y-6">
      {!file && (
        <EmptyState
          icon={Pipette}
          title="Color Palette from Image"
          description="Upload an image to extract its dominant colors"
          hint="Tip: ⌘V to paste an image from clipboard"
        >
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'] }}
            label="Drop an image"
            hint="PNG, JPG, WebP, GIF, or BMP — or paste from clipboard"
          />
        </EmptyState>
      )}

      {file && imageUrl && (
        <ExtractedPaletteSection
          file={file}
          imageUrl={imageUrl}
          colors={colors}
          loading={loading}
          exportFormat={exportFormat}
          onExportFormatChange={(nextExportFormat) => setParams({ exportFormat: nextExportFormat })}
          onReset={handleReset}
        />
      )}

      <HarmonySection
        baseHex={baseHex}
        harmony={harmony}
        onBaseHexChange={(nextBaseHex) => setParams({ baseHex: nextBaseHex })}
        onHarmonyChange={(nextHarmony) => setParams({ harmony: nextHarmony })}
      />
    </div>
  );
}
