'use client';

import { useState } from 'react';
import { Scissors, Download } from 'lucide-react';
import { ToolLayout, ControlPanel, FileUpload, Button, PdfPreview, ErrorAlert } from '@/app/components/shared';
import { loadPdf, splitPdfPages } from '@/app/lib/tools';
import { downloadPdfsAsZip, validatePdfFile } from '@/app/lib/utils';
import { useFileUpload, usePdfPreview, useLoadingMessage } from '@/app/lib/hooks';
import { LoadedPdf } from '@/app/lib/types';

export default function SplitPage() {
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const { loading, execute } = useLoadingMessage();

  const { file: pdf, error: fileError, handleFilesSelected } = useFileUpload<LoadedPdf>({
    accept: '.pdf',
    validator: validatePdfFile,
    transformFile: async (selectedFile) => {
      return await loadPdf(selectedFile);
    },
  });

  const { canvasRef, currentPage, totalPages, setCurrentPage } = usePdfPreview(pdf);

  const handleSplit = async () => {
    if (!pdf) return;

    const result = await execute(
      async () => {
        const splitBlobs = await splitPdfPages(pdf);
        setBlobs(splitBlobs);
        return splitBlobs;
      },
      `✓ Split ${pdf.pages} pages`
    );
    if (!result) {
      setBlobs([]);
    }
  };

  const downloadPages = async () => {
    const fileName = `${pdf?.name.replace('.pdf', '')}-split.zip` || 'split-pages.zip';
    await downloadPdfsAsZip(blobs, fileName);
  };

  return (
    <ToolLayout path="/docs/split">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FileUpload label="Upload PDF" accept=".pdf" onFilesSelected={handleFilesSelected} />

          {fileError && <ErrorAlert error={fileError} />}

          {pdf && (
            <ControlPanel title="Loaded PDF">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>{pdf.name}</strong> - {pdf.pages} pages
              </p>
            </ControlPanel>
          )}

          <Button onClick={handleSplit} loading={loading} disabled={!pdf} className="w-full flex items-center justify-center gap-2">
            <Scissors className="w-4 h-4" />
            Split Pages
          </Button>
        </div>

        <div className="space-y-4">
          <PdfPreview
            canvasRef={canvasRef}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isLoaded={!!pdf}
          />

          {blobs.length > 0 && (
            <Button onClick={downloadPages} className="w-full flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Pages ({blobs.length})
            </Button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
