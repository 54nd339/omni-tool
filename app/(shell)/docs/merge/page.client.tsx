'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, Download } from 'lucide-react';
import { ToolLayout, FileUpload, Button, PdfPreview, DraggableList, ErrorAlert } from '@/app/components/shared';
import { mergePdfs, getPdfPageCount, loadPdf, renderPdfPreview, renderPdfPage } from '@/app/lib/tools';
import { useFileUpload, useObjectUrl, useLoadingMessage } from '@/app/lib/hooks';
import { LoadedPdf } from '@/app/lib/types';
import { downloadBlob, validatePdfFile } from '@/app/lib/utils';

export default function MergePage() {
  const [files, setFiles] = useState<LoadedPdf[]>([]);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPageState] = useState(1);

  const { loading, execute, setMessage } = useLoadingMessage();

  const setCurrentPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPageState(validPage);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputUrl = useObjectUrl(outputBlob);

  const { error: fileError, handleFilesSelected } = useFileUpload<LoadedPdf>({
    accept: '.pdf',
    maxFiles: Infinity,
    validator: validatePdfFile,
    onFilesSelected: async (selectedFiles: File[]) => {
      const pdfs = await Promise.all(selectedFiles.map((file) => loadPdf(file)));
      setFiles((prev) => [...prev, ...pdfs]);
      return pdfs;
    },
  });

  const renderPreview = useCallback(async () => {
    if (!outputBlob || !canvasRef.current) return;
    try {
      if (currentPage === 1) {
        await renderPdfPreview(outputUrl!, canvasRef.current);
        const pages = await getPdfPageCount(outputBlob);
        setTotalPages(pages);
      } else {
        await renderPdfPage(outputBlob, currentPage, canvasRef.current);
      }
    } catch (error) {
      console.error('PDF preview error:', error);
    }
  }, [outputBlob, outputUrl, currentPage]);

  useEffect(() => {
    if (outputUrl && canvasRef.current && outputBlob) {
      renderPreview();
    }
  }, [outputUrl, outputBlob, renderPreview]);

  const handleMerge = async () => {
    if (files.length < 2) {
      setMessage('Add at least two PDFs to merge');
      return;
    }

    setCurrentPageState(1);
    await execute(
      async () => {
        const blob = await mergePdfs(files);
        setOutputBlob(blob);
        const pages = await getPdfPageCount(blob);
        setTotalPages(pages);
        return blob;
      },
      '✓ PDFs merged successfully'
    );
  };

  const downloadMerged = () => {
    if (!outputBlob) return;
    downloadBlob(outputBlob, 'merged.pdf');
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const reorderFiles = (reorderedFiles: LoadedPdf[]) => {
    setFiles(reorderedFiles);
  };

  return (
    <ToolLayout path="/docs/merge">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FileUpload label="Add PDF files" accept=".pdf" multiple onFilesSelected={handleFilesSelected} />

          {fileError && <ErrorAlert error={fileError} />}

          {files.length > 0 && (
            <DraggableList
              items={files}
              onReorder={reorderFiles}
              onRemove={removeFile}
              title={`Selected Files (${files.length})`}
              renderMetadata={(pdf) => (
                <>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{pdf.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{pdf.pages} pages</p>
                </>
              )}
            />
          )}

          <Button onClick={handleMerge} loading={loading} disabled={files.length < 2} className="w-full flex items-center justify-center gap-2">
            <Layers className="w-4 h-4" />
            Merge PDFs
          </Button>
        </div>

        <div className="space-y-4">
          <PdfPreview
            canvasRef={canvasRef}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isLoaded={!!outputUrl}
            label="Preview"
          />

          {outputBlob && (
            <Button onClick={downloadMerged} className="w-full flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Merged PDF
            </Button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
