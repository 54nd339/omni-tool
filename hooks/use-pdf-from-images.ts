'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { usePdfOps } from '@/hooks/worker-hooks';
import { downloadBlob, pluralize, reorderByIds } from '@/lib/utils';

interface ImageEntry {
  id: string;
  file: File;
  name: string;
  preview: string;
  size: number;
}

export function usePdfFromImages() {
  const { run, status } = usePdfOps();
  const [images, setImages] = useState<ImageEntry[]>([]);

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  const handleFiles = useCallback((files: File[]) => {
    const entries: ImageEntry[] = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: `img-${crypto.randomUUID()}`,
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
        size: file.size,
      }));

    setImages((previous) => [...previous, ...entries]);
  }, []);

  const handleReorder = useCallback((ids: string[]) => {
    setImages((previous) => reorderByIds(previous, ids, (image) => image.id));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages((previous) => {
      const image = previous.find((value) => value.id === id);
      if (image) URL.revokeObjectURL(image.preview);
      return previous.filter((value) => value.id !== id);
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (images.length === 0) return;

    try {
      const pdfBytes = await run((api) =>
        api.createPdfFromImages(
          images.map((image) => ({ blob: image.file, name: image.name })),
        ),
      );
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      downloadBlob(blob, 'images.pdf');
      toast.success('PDF created');
    } catch {
      toast.error('PDF creation failed');
    }
  }, [images, run]);

  const handleClear = useCallback(() => {
    setImages((previous) => {
      previous.forEach((image) => URL.revokeObjectURL(image.preview));
      return [];
    });
  }, []);

  return {
    handleClear,
    handleFiles,
    handleGenerate,
    handleRemove,
    handleReorder,
    images,
    pluralize,
    status,
  };
}
