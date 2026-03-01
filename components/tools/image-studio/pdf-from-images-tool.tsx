'use client';

import { useCallback, useState } from 'react';
import { FileImage } from 'lucide-react';
import { toast } from 'sonner';
import { reorderByIds, pluralize } from '@/lib/utils';
import { usePdfOps, useDownload } from '@/hooks';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { DndSortableList } from '@/components/shared/dnd-sortable-list';
import { FilePreview } from '@/components/shared/file-preview';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ImageEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
}

let counter = 0;

export function PdfFromImagesTool() {
  const { run, status } = usePdfOps();
  const { download } = useDownload();
  const [images, setImages] = useState<ImageEntry[]>([]);

  const handleFiles = useCallback((files: File[]) => {
    const entries: ImageEntry[] = files
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => {
        counter += 1;
        return {
          id: `img-${counter}`,
          file: f,
          name: f.name,
          size: f.size,
          preview: URL.createObjectURL(f),
        };
      });
    setImages((prev) => [...prev, ...entries]);
  }, []);

  const handleReorder = useCallback(
    (ids: string[]) => {
      setImages(reorderByIds(images, ids, (img) => img.id));
    },
    [images],
  );

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (images.length === 0) return;

    try {
      const pdfBytes = await run((api) =>
        api.createPdfFromImages(
          images.map((img) => ({ blob: img.file, name: img.name })),
        ),
      );
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      download(blob, 'images.pdf');
      toast.success('PDF created');
    } catch {
      toast.error('PDF creation failed');
    }
  }, [images, run, download]);

  return (
    <div className="space-y-6">
      {images.length === 0 ? (
        <EmptyState icon={FileImage} title="Create PDF from images" description="Drop images to combine into a single PDF">
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
            <Button variant="ghost" onClick={() => setImages([])}>
              Clear all
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
