'use client';

import { useImagePlaceholder } from '@/hooks/use-image-placeholder';

import { ImagePlaceholderProvider, SettingsPanel } from './settings-panel';

export function ImagePlaceholderTool() {
  const placeholder = useImagePlaceholder();
  const { canvasRef, ...placeholderContext } = placeholder;

  return (
    <ImagePlaceholderProvider value={placeholderContext}>
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <SettingsPanel />

          <div className="flex min-h-[200px] items-center justify-center">
            <div className="max-h-[400px] overflow-auto rounded-lg border border-border bg-muted/20 p-4">
              <canvas ref={canvasRef} className="block max-h-[400px] max-w-full w-auto rounded object-contain" />
            </div>
          </div>
        </div>
      </div>
    </ImagePlaceholderProvider>
  );
}
