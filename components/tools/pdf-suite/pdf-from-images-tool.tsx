'use client';

import { FileImage } from 'lucide-react';

import { DndSortableList } from '@/components/shared/dnd-sortable-list';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { FilePreview } from '@/components/shared/file-preview';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePdfFromImages } from '@/hooks/use-pdf-from-images';

export function PdfFromImagesTool() {
  const {
    handleClear,
    handleFiles,
    handleGenerate,
    handleRemove,
    handleReorder,
    images,
    pluralize,
    status,
  } = usePdfFromImages();

  return (
    <div className="space-y-6">
      {images.length === 0 ? (
        <EmptyState
          icon={FileImage}
          title="Create PDF from images"
          description="Drop images to combine into a single PDF"
        >
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
            multiple
            label="Drop images to combine into a PDF"
            hint="PNG or JPG. Drag to reorder after upload."
          />
        </EmptyState>
      ) : (
        <>
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
            multiple
            label="Drop images to combine into a PDF"
            hint="PNG or JPG. Drag to reorder after upload."
          />
          <DndSortableList
            items={images}
            onReorder={handleReorder}
            renderItem={(img) => (
              <FilePreview
                name={img.name}
                size={img.size}
                preview={img.preview}
                onRemove={() => handleRemove(img.id)}
              />
            )}
          />

          {status === 'processing' && (
            <Progress value={undefined} label="Creating PDF" className="h-2" />
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={status === 'processing'}
              loading={status === 'processing'}
            >
              Create PDF ({images.length} {pluralize(images.length, 'image')})
            </Button>
            <Button variant="ghost" onClick={handleClear}>
              Clear all
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
