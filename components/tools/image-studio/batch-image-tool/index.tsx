'use client';

import { Images } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { useBatchImage } from '@/hooks/use-batch-image';
import {
  IMAGE_ACCEPT,
} from '@/lib/image/batch-image';

import { BatchControls, BatchImageControlsProvider } from './batch-controls';
import { BatchGrid } from './batch-grid';

export function BatchImageTool() {
  const {
    clearAll,
    doneCount,
    downloadAll,
    format,
    handleFiles,
    height,
    items,
    operation,
    processAll,
    processing,
    progress,
    quality,
    removeItem,
    setFormat,
    setHeight,
    setOperation,
    setQuality,
    setWidth,
    width,
  } = useBatchImage();

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <FileDropzone
          onFiles={handleFiles}
          accept={IMAGE_ACCEPT}
          multiple
          maxFiles={50}
          label="Drop images here or click to browse"
          hint="JPEG, PNG, WebP, AVIF, BMP, GIF — up to 50 images"
        />
        <EmptyState
          icon={Images}
          title="Batch Image Processing"
          description="Drop multiple images, apply the same operation to all, and download as ZIP."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileDropzone
        onFiles={handleFiles}
        accept={IMAGE_ACCEPT}
        multiple
        maxFiles={50}
        label="Add more images"
        className="min-h-[80px] sm:min-h-[100px]"
      />

      <BatchImageControlsProvider
        value={{
          clearAll,
          doneCount,
          downloadAll,
          format,
          height,
          items,
          itemsCount: items.length,
          operation,
          processAll,
          processing,
          progress,
          quality,
          removeItem,
          setFormat,
          setHeight,
          setOperation,
          setQuality,
          setWidth,
          width,
        }}
      >
        <BatchControls />
        <BatchGrid />
      </BatchImageControlsProvider>
    </div>
  );
}
