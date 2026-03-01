'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { usePdfOps, useDownload } from '@/hooks';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { groupConsecutivePages } from '@/lib/pdf';
import { pdfToImages } from '@/lib/pdf/to-image';

type ToolMode = 'split' | 'to-image';
type DownloadMode = 'pdf' | 'png';

export function SplitPdfTool() {
  const { run, status } = usePdfOps();
  const { download } = useDownload();

  const [mode, setMode] = useState<ToolMode>('split');
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [downloadMode, setDownloadMode] = useState<DownloadMode>('pdf');
  const [scale, setScale] = useState(2);
  const [imagePreviews, setImagePreviews] = useState<{ page: number; url: string }[]>([]);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const f = files[0];
      if (!f) return;
      setFile(f);
      setSelectedPages(new Set());
      setThumbnails([]);
      setImagePreviews([]);

      try {
        const buf = await f.arrayBuffer();
        setPdfBuffer(buf);
        const count = await run((api) => api.getPdfPageCount(buf));
        setTotalPages(count);
        setSelectedPages(new Set(Array.from({ length: count }, (_, i) => i + 1)));
      } catch {
        toast.error('Could not read PDF');
      }
    },
    [run],
  );

  // Generate thumbnails when the PDF buffer changes
  useEffect(() => {
    if (!pdfBuffer || totalPages === 0) return;
    let cancelled = false;

    const generateThumbs = async () => {
      try {
        const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
        const blobs = await pdfToImages(pdfBuffer, { scale: 0.3, pageNumbers: allPages });
        if (cancelled) return;
        setThumbnails(blobs.map((b) => URL.createObjectURL(b)));
      } catch (e) {
        if (process.env.NODE_ENV === 'development') console.warn('Thumbnail generation failed', e);
      }
    };

    generateThumbs();
    return () => { cancelled = true; };
  }, [pdfBuffer, totalPages, run]);

  const togglePage = useCallback((page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  }, []);

  const handleDownload = useCallback(async () => {
    if (!file || !pdfBuffer || selectedPages.size === 0) return;

    const sorted = [...selectedPages].sort((a, b) => a - b);
    const baseName = file.name.replace(/\.pdf$/i, '');

    try {
      if (downloadMode === 'png') {
        // Convert selected pages to images
        const blobs = await pdfToImages(pdfBuffer, { scale, pageNumbers: sorted });

        if (blobs.length === 1) {
          download(blobs[0], `${baseName}-page-${sorted[0]}.png`);
        } else {
          const { default: JSZip } = await import('jszip');
          const zip = new JSZip();
          blobs.forEach((blob, i) => {
            zip.file(`${baseName}-page-${sorted[i]}.png`, blob);
          });
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          download(zipBlob, `${baseName}-images.zip`);
        }
        toast.success(`${blobs.length} page${blobs.length > 1 ? 's' : ''} converted to PNG`);
        setImagePreviews(blobs.map((blob, i) => ({
          page: sorted[i],
          url: URL.createObjectURL(blob),
        })));
      } else {
        // Merge selected pages into a single PDF
        const ranges = groupConsecutivePages(sorted.map((p) => p - 1));
        const parts = await run((api) => api.splitPdf(pdfBuffer, ranges));
        if (parts.length === 1) {
          const blob = new Blob([parts[0] as BlobPart], { type: 'application/pdf' });
          download(blob, `${baseName}-pages.pdf`);
        } else {
          const { default: JSZip } = await import('jszip');
          const zip = new JSZip();
          parts.forEach((data, i) => {
            zip.file(`${baseName}-part-${i + 1}.pdf`, data);
          });
          const blob = await zip.generateAsync({ type: 'blob' });
          download(blob, `${baseName}-split.zip`);
        }
        toast.success('PDF pages extracted');
      }
    } catch {
      toast.error('Operation failed');
    }
  }, [file, pdfBuffer, selectedPages, downloadMode, scale, run, download]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPdfBuffer(null);
    setTotalPages(0);
    setSelectedPages(new Set());
    setThumbnails([]);
    setImagePreviews([]);
    setDownloadMode('pdf');
  }, []);

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
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {totalPages} pages &middot; {selectedPages.size} selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPages(new Set(Array.from({ length: totalPages }, (_, i) => i + 1)))}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Select all
                </button>
                <button
                  onClick={() => setSelectedPages(new Set())}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Select none
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => togglePage(page)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-2 text-sm transition-colors ${selectedPages.has(page)
                      ? 'border-foreground bg-muted font-medium'
                      : 'border-border hover:bg-muted/50'
                      }`}
                  >
                    {thumbnails[i] ? (
                      <img
                        src={thumbnails[i]}
                        alt={`Page ${page}`}
                        className="h-32 w-full rounded-md object-contain sm:h-40 lg:h-48"
                      />
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center rounded-md bg-muted/30 text-muted-foreground sm:h-40 lg:h-48">
                        {page}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">Page {page}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sticky bottom-6 z-10 mt-8 flex flex-col gap-4 rounded-xl border bg-background/95 p-4 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Download as</p>
              <div className="flex flex-wrap items-end gap-4">
                <ToggleGroup
                  type="single"
                  value={downloadMode}
                  onValueChange={(v) => v && setDownloadMode(v as DownloadMode)}
                >
                  <ToggleGroupItem value="pdf">Merged PDF</ToggleGroupItem>
                  <ToggleGroupItem value="png">PNG Images</ToggleGroupItem>
                </ToggleGroup>

                {downloadMode === 'png' && (
                  <div className="min-w-[120px] max-w-[160px] flex-1">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Scale: {scale}x
                    </p>
                    <Slider
                      min={1}
                      max={4}
                      step={0.5}
                      value={[scale]}
                      onValueChange={([v]) => setScale(v)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto">
              {status === 'processing' && (
                <Progress value={undefined} label="Processing PDF" className="h-2" />
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset} className="flex-1 sm:flex-none">
                  New PDF
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={status === 'processing' || selectedPages.size === 0}
                  loading={status === 'processing'}
                  className="flex-1 sm:flex-none"
                >
                  {downloadMode === 'png' ? 'Convert & Download' : 'Split & Download'}
                </Button>
              </div>
            </div>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imagePreviews.map((p) => (
                <div key={p.page} className="overflow-hidden rounded-lg border border-border">
                  <img src={p.url} alt={`Page ${p.page}`} className="w-full" />
                  <p className="px-3 py-2 text-xs text-muted-foreground">Page {p.page}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
