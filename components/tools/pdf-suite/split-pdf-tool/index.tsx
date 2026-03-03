'use client';

import { FileText } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { usePdfSplit } from '@/hooks/use-pdf-split';

import { DownloadControls } from './download-controls';
import { ImagePreviewsGrid } from './image-previews-grid';
import { PageSelectionGrid } from './page-selection-grid';

export function SplitPdfTool() {
  const {
    clearSelectedPages,
    downloadMode,
    file,
    handleDownload,
    handleFiles,
    handleReset,
    imagePreviews,
    scale,
    selectAllPages,
    selectedPages,
    setDownloadMode,
    setScale,
    status,
    thumbnails,
    togglePage,
    totalPages,
  } = usePdfSplit();

  return (
    <div className="space-y-6">
      {!file && (
        <EmptyState icon={FileText} title="PDF Tools" description="Split PDFs, extract pages, and convert to images">
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'application/pdf': ['.pdf'] }}
            label="Drop a PDF"
            hint="Split, extract, or convert to images"
          />
        </EmptyState>
      )}

      {file && totalPages > 0 && (
        <>
          <PageSelectionGrid
            clearSelectedPages={clearSelectedPages}
            selectAllPages={selectAllPages}
            selectedPages={selectedPages}
            thumbnails={thumbnails}
            togglePage={togglePage}
            totalPages={totalPages}
          />

          <DownloadControls
            downloadMode={downloadMode}
            onDownload={handleDownload}
            onModeChange={setDownloadMode}
            onReset={handleReset}
            onScaleChange={setScale}
            scale={scale}
            selectedCount={selectedPages.size}
            status={status}
          />

          <ImagePreviewsGrid imagePreviews={imagePreviews} />
        </>
      )}
    </div>
  );
}
