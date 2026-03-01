'use client';

import { useCallback, useState } from 'react';
import { Combine } from 'lucide-react';
import { toast } from 'sonner';
import { reorderByIds, pluralize } from '@/lib/utils';
import { usePdfOps, useDownload } from '@/hooks';
import { pdfToImages } from '@/lib/pdf/to-image';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { DndSortableList } from '@/components/shared/dnd-sortable-list';
import { FilePreview } from '@/components/shared/file-preview';
import { ShareButton } from '@/components/shared/share-button';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface PdfEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number | null;
  thumbUrl: string | null;
}

let counter = 0;

export function MergePdfsTool() {
  const { run, status } = usePdfOps();
  const { download } = useDownload();
  const [pdfs, setPdfs] = useState<PdfEntry[]>([]);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const entries: PdfEntry[] = [];
      for (const f of files) {
        if (f.type !== 'application/pdf') continue;
        counter += 1;
        let pages: number | null = null;
        let thumbUrl: string | null = null;
        try {
          const buf = await f.arrayBuffer();
          pages = await run((api) => api.getPdfPageCount(buf));
          // Generate first-page thumbnail
          const blobs = await pdfToImages(buf, { scale: 0.3, pageNumbers: [1] });
          if (blobs[0]) thumbUrl = URL.createObjectURL(blobs[0]);
        } catch (e) {
          if (process.env.NODE_ENV === 'development') console.warn('PDF read failed', e);
        }
        entries.push({
          id: `pdf-${counter}`,
          file: f,
          name: f.name,
          size: f.size,
          pages,
          thumbUrl,
        });
      }
      setPdfs((prev) => [...prev, ...entries]);
    },
    [run],
  );

  const handleReorder = useCallback(
    (ids: string[]) => {
      setPdfs(reorderByIds(pdfs, ids, (p) => p.id));
    },
    [pdfs],
  );

  const handleRemove = useCallback((id: string) => {
    setPdfs((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleMerge = useCallback(async () => {
    if (pdfs.length < 2) {
      toast.error('Add at least 2 PDFs to merge');
      return;
    }

    try {
      const buffers = await Promise.all(
        pdfs.map((p) => p.file.arrayBuffer()),
      );
      const result = await run((api) => api.mergePdfs(buffers));
      const blob = new Blob([result as BlobPart], { type: 'application/pdf' });
      setResultBlob(blob);
      download(blob, 'merged.pdf');
      toast.success('PDFs merged');
    } catch {
      toast.error('Merge failed');
    }
  }, [pdfs, run, download]);

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
            <Button variant="ghost" onClick={() => setPdfs([])}>
              Clear all
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
