'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { usePdfOps } from '@/hooks/worker-hooks';
import { pdfToImages } from '@/lib/pdf/to-image';
import { downloadBlob, reorderByIds } from '@/lib/utils';

interface PdfEntry {
  file: File;
  id: string;
  name: string;
  pages: number | null;
  size: number;
  thumbUrl: string | null;
}

export function usePdfMerge() {
  const { run, status } = usePdfOps();

  const [pdfs, setPdfs] = useState<PdfEntry[]>([]);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const entries: PdfEntry[] = [];

      for (const file of files) {
        if (file.type !== 'application/pdf') continue;

        let pages: number | null = null;
        let thumbUrl: string | null = null;

        try {
          const buffer = await file.arrayBuffer();
          pages = await run((api) => api.getPdfPageCount(buffer));
          const blobs = await pdfToImages(buffer, { scale: 0.3, pageNumbers: [1] });
          if (blobs[0]) thumbUrl = URL.createObjectURL(blobs[0]);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('PDF read failed', error);
          }
        }

        entries.push({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          pages,
          thumbUrl,
        });
      }

      setPdfs((prev) => [...prev, ...entries]);
    },
    [run],
  );

  const handleReorder = useCallback((ids: string[]) => {
    setPdfs((prev) => reorderByIds(prev, ids, (item) => item.id));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setPdfs((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleMerge = useCallback(async () => {
    if (pdfs.length < 2) {
      toast.error('Add at least 2 PDFs to merge');
      return;
    }

    try {
      const buffers = await Promise.all(pdfs.map((pdf) => pdf.file.arrayBuffer()));
      const result = await run((api) => api.mergePdfs(buffers));
      const blob = new Blob([result as BlobPart], { type: 'application/pdf' });
      setResultBlob(blob);
      downloadBlob(blob, 'merged.pdf');
      toast.success('PDFs merged');
    } catch {
      toast.error('Merge failed');
    }
  }, [pdfs, run]);

  const handleClear = useCallback(() => {
    setPdfs([]);
    setResultBlob(null);
  }, []);

  return {
    handleClear,
    handleFiles,
    handleMerge,
    handleRemove,
    handleReorder,
    pdfs,
    resultBlob,
    status,
  };
}
