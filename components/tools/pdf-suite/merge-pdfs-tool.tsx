'use client';

import { Combine } from 'lucide-react';

import { DndSortableList } from '@/components/shared/dnd-sortable-list';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { FilePreview } from '@/components/shared/file-preview';
import { ShareButton } from '@/components/shared/tool-actions/share-button';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePdfMerge } from '@/hooks/use-pdf-merge';
import { pluralize } from '@/lib/utils';

export function MergePdfsTool() {
  const { handleClear, handleFiles, handleMerge, handleRemove, handleReorder, pdfs, resultBlob, status } = usePdfMerge();

  return (
    <div className="space-y-6">
      {pdfs.length === 0 ? (
        <EmptyState icon={Combine} title="Merge PDFs" description="Drop PDF files to combine them in order">
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'application/pdf': ['.pdf'] }}
            multiple
            label="Drop PDF files to merge"
            hint="Drag to reorder after upload"
          />
        </EmptyState>
      ) : (
        <>
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'application/pdf': ['.pdf'] }}
            multiple
            label="Drop PDF files to merge"
            hint="Drag to reorder after upload"
          />
          <DndSortableList
            items={pdfs}
            onReorder={handleReorder}
            renderItem={(pdf) => (
              <FilePreview
                name={pdf.name}
                size={pdf.size}
                preview={pdf.thumbUrl ?? undefined}
                onRemove={() => handleRemove(pdf.id)}
              />
            )}
          />

          {status === 'processing' && (
            <Progress value={undefined} label="Merging PDFs" className="h-2" />
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleMerge}
              disabled={status === 'processing' || pdfs.length < 2}
              loading={status === 'processing'}
            >
              Merge {pdfs.length} {pluralize(pdfs.length, 'PDF', 'PDFs')}
            </Button>
            <ShareButton blob={resultBlob} fileName="merged.pdf" />
            <Button variant="ghost" onClick={handleClear}>
              Clear all
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
