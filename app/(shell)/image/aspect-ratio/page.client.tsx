'use client';

import { useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { ToolLayout, FileUpload, Button, ErrorAlert } from '@/app/components/shared';
import { useFileUpload, useObjectUrl } from '@/app/lib/hooks';
import { validateImageFile } from '@/app/lib/utils';
import { AspectRatioProvider, useAspectRatioContext } from './components/AspectRatioContext';
import { AspectRatioControls } from './components/AspectRatioControls';
import { ImagePreviewPanel } from './components/ImagePreviewPanel';
import { AspectRatioOutputPanel } from './components/AspectRatioOutputPanel';

function AspectRatioContent() {
  const {
    state,
    selectedRatio,
    setImage,
    processImage,
    canvasRef,
  } = useAspectRatioContext();

  const imageUrl = useObjectUrl(state.image?.file || null);

  // Auto-regenerate when settings change
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    processImage(imageUrl, canvasRef.current);
  }, [
    canvasRef,
    imageUrl,
    processImage,
    selectedRatio.id,
    selectedRatio.width,
    selectedRatio.height,
    state.longEdge,
  ]);

  const { handleFilesSelected, error: fileError } = useFileUpload({
    accept: 'image/*',
    validator: validateImageFile,
    onFileSelected: (file) => {
      setImage({ file });
    },
  });

  return (
    <ToolLayout path="/image/aspect-ratio">
      {!state.image ? (
        <div className="max-w-xl mx-auto">
          <FileUpload
            label="Upload Image"
            accept="image/*"
            onFilesSelected={handleFilesSelected}
          />
          {fileError && <ErrorAlert error={fileError} className="mt-4" />}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="space-y-4 xl:col-span-1">
            <Button
              variant="outline"
              onClick={() => setImage(null)}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Start Over
            </Button>
            <AspectRatioControls />
          </div>

          <div className="space-y-4 xl:col-span-1">
            <ImagePreviewPanel />
          </div>

          <div className="space-y-4 xl:col-span-1">
            <AspectRatioOutputPanel />
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}

export default function AspectRatioPadPage() {
  return (
    <AspectRatioProvider>
      <AspectRatioContent />
    </AspectRatioProvider>
  );
}
