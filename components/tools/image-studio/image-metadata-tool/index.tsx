'use client';

import { ImageIcon } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { Button } from '@/components/ui/button';
import { useImageMetadataTool } from '@/hooks/use-image-metadata-tool';

import { MetadataTable } from './metadata-table';

export function ImageMetadataTool() {
  const {
    file,
    handleFiles,
    handleStripAndDownload,
    metadata,
    metadataEntries,
    stripLoading,
  } = useImageMetadataTool();

  if (!file) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={ImageIcon}
          title="Image Metadata Viewer"
          description="Upload an image to view its EXIF metadata and file information"
          hint="Tip: ⌘V to paste an image from clipboard"
        >
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] }}
            label="Drop an image or click to browse"
            hint="JPEG files show full EXIF; other formats show file info only"
          />
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileDropzone
        onFiles={handleFiles}
        accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] }}
        label="Drop another image or click to change"
        hint="JPEG files show full EXIF; other formats show file info only"
      />

      {metadata && (
        <>
          {!metadata.hasExif && (
            <p className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
              No EXIF data found. Showing basic file info only. (EXIF is typically present in JPEG files from cameras.)
            </p>
          )}

          <MetadataTable entries={metadataEntries} />

          <div className="flex gap-3">
            <Button onClick={handleStripAndDownload} disabled={stripLoading}>
              {stripLoading ? 'Processing…' : 'Strip metadata & download'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
