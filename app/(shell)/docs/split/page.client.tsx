'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, FileDown, FolderDown } from 'lucide-react';
import { ToolLayout, ControlPanel, FileUpload, Button, ErrorAlert, DraggableList } from '@/app/components/shared';
import { loadPdf, splitPdfPages, mergePdfBlobs } from '@/app/lib/tools';
import { downloadPdfsAsZip, validatePdfFile, downloadBlob } from '@/app/lib/utils';
import { useFileUpload, useLoadingMessage } from '@/app/lib/hooks';
import { LoadedPdf } from '@/app/lib/types';

interface PageBlob {
  blob: Blob;
  pageNumber: number;
}

export default function SplitPage() {
  const [pageBlobs, setPageBlobs] = useState<PageBlob[]>([]);
  const { loading, execute } = useLoadingMessage();
  const lastPdfRef = useRef<LoadedPdf | null>(null);
  const hasSplitRef = useRef<boolean>(false);

  const { file: pdf, error: fileError, handleFilesSelected } = useFileUpload<LoadedPdf>({
    accept: '.pdf',
    validator: validatePdfFile,
    transformFile: async (selectedFile) => {
      return await loadPdf(selectedFile);
    },
  });

  // Automatically split when PDF is loaded
  useEffect(() => {
    if (!pdf) {
      lastPdfRef.current = null;
      hasSplitRef.current = false;
      return;
    }

    // Check if this is the same PDF object (already processed)
    if (lastPdfRef.current === pdf && hasSplitRef.current) {
      console.log('Same PDF object already processed, skipping split');
      return;
    }

    let cancelled = false;
    lastPdfRef.current = pdf;
    hasSplitRef.current = false;
    
    console.log('New PDF detected, starting split. Name:', pdf.name, 'Pages:', pdf.pages, 'File size:', pdf.file.size);

    const performSplit = async () => {
      try {
        const result = await execute(
          async () => {
            console.log('Starting split for PDF:', pdf.name, 'pages:', pdf.pages);
            const splitBlobs = await splitPdfPages(pdf);
            console.log('Split completed, blobs:', splitBlobs?.length || 0);
            
            if (cancelled) {
              console.log('Operation cancelled');
              return null;
            }
            
            if (!splitBlobs || splitBlobs.length === 0) {
              console.error('No blobs returned from split');
              return null;
            }
            
            const pages: PageBlob[] = splitBlobs.map((blob, index) => ({
              blob,
              pageNumber: index + 1,
            }));
            
            console.log('Pages created:', pages.length);
            
            if (!cancelled) {
              setPageBlobs(pages);
              hasSplitRef.current = true;
              console.log('PageBlobs state updated, length:', pages.length);
            }
            return splitBlobs;
          },
          `✓ Split ${pdf.pages} pages`
        );
        
        console.log('Execute finished, result:', result ? `${result.length} blobs` : 'null');
        
        if (!result && !cancelled) {
          console.error('Split failed - result is null');
        }
      } catch (error) {
        console.error('Split error:', error);
        if (!cancelled) {
          setPageBlobs([]);
        }
      }
    };

    performSplit();

    return () => {
      cancelled = true;
    };
  }, [pdf, execute]);

  const handleReorder = (reorderedPages: PageBlob[]) => {
    // Update page numbers after reordering
    const updatedPages = reorderedPages.map((page, index) => ({
      ...page,
      pageNumber: index + 1,
    }));
    setPageBlobs(updatedPages);
  };

  const handleRemove = (index: number) => {
    setPageBlobs((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // Update page numbers after removal
      return filtered.map((page, i) => ({
        ...page,
        pageNumber: i + 1,
      }));
    });
  };

  const downloadMerged = async () => {
    if (pageBlobs.length === 0) return;
    const blobs = pageBlobs.map((p) => p.blob);
    const mergedBlob = await mergePdfBlobs(blobs);
    const fileName = `${pdf?.name.replace('.pdf', '')}-merged.pdf` || 'merged.pdf';
    downloadBlob(mergedBlob, fileName);
  };

  const downloadAsZip = async () => {
    if (pageBlobs.length === 0) return;
    const blobs = pageBlobs.map((p) => p.blob);
    const fileName = `${pdf?.name.replace('.pdf', '')}-split.zip` || 'split-pages.zip';
    await downloadPdfsAsZip(blobs, fileName);
  };

  const downloadIndividual = (index: number) => {
    if (index < 0 || index >= pageBlobs.length) return;
    const page = pageBlobs[index];
    const fileName = `${pdf?.name.replace('.pdf', '')}-page-${page.pageNumber}.pdf` || `page-${page.pageNumber}.pdf`;
    downloadBlob(page.blob, fileName);
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
              {loading && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Splitting pages...
                </p>
              )}
            </ControlPanel>
          )}
        </div>
        <div className="space-y-4">
          {pageBlobs.length > 0 ? (
            <>
              <DraggableList
                items={pageBlobs}
                onReorder={handleReorder}
                onRemove={handleRemove}
                title={`Split Pages (${pageBlobs.length})`}
                renderMetadata={(page) => (
                  <>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Page {page.pageNumber}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(page.blob.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                )}
                renderAction={(page, index) => (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadIndividual(index);
                    }}
                    variant="ghost"
                    className="text-blue-500 hover:text-blue-600 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0 mr-1"
                    title="Download page"
                  >
                    <FileDown className="w-4 h-4" />
                  </Button>
                )}
                getItemKey={(_, index) => index}
              />

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={downloadMerged} className="flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Merged PDF
                </Button>
                <Button onClick={downloadAsZip} variant="outline" className="flex items-center justify-center gap-2">
                  <FolderDown className="w-4 h-4" />
                  Download as ZIP
                </Button>
              </div>
            </>
          ) : pdf && loading ? (
            <ControlPanel title="Processing">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Splitting PDF into individual pages...
              </p>
            </ControlPanel>
          ) : null}
        </div>
      </div>
    </ToolLayout>
  );
}
