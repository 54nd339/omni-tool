'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { usePdfOps } from '@/hooks/worker-hooks';
import {
  buildAllPagesSet,
  buildPdfDownloadResult,
  buildPngDownloadResult,
  type DownloadMode,
  getPdfBaseName,
  getSortedPages,
  revokeObjectUrls,
} from '@/lib/pdf/split-download';
import { pdfToImages } from '@/lib/pdf/to-image';
import { downloadBlob } from '@/lib/utils';

export function usePdfSplit() {
  const { run, status } = usePdfOps();
  const download = downloadBlob;

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
      const selectedFile = files[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      setSelectedPages(new Set());
      setThumbnails((prev) => {
        revokeObjectUrls(prev);
        return [];
      });
      setImagePreviews((prev) => {
        revokeObjectUrls(prev.map((item) => item.url));
        return [];
      });

      try {
        const buffer = await selectedFile.arrayBuffer();
        setPdfBuffer(buffer);
        const count = await run((api) => api.getPdfPageCount(buffer));
        setTotalPages(count);
        setSelectedPages(buildAllPagesSet(count));
      } catch {
        toast.error('Could not read PDF');
      }
    },
    [run],
  );

  useEffect(() => {
    if (!pdfBuffer || totalPages === 0) return;
    let cancelled = false;

    const generateThumbs = async () => {
      try {
        const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
        const blobs = await pdfToImages(pdfBuffer, { scale: 0.3, pageNumbers: allPages });
        if (cancelled) return;
        const nextThumbnails = blobs.map((blob) => URL.createObjectURL(blob));
        setThumbnails((prev) => {
          revokeObjectUrls(prev);
          return nextThumbnails;
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Thumbnail generation failed', error);
        }
      }
    };

    void generateThumbs();

    return () => {
      cancelled = true;
    };
  }, [pdfBuffer, totalPages]);

  const togglePage = useCallback((page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  }, []);

  const selectAllPages = useCallback(() => {
    setSelectedPages(buildAllPagesSet(totalPages));
  }, [totalPages]);

  const clearSelectedPages = useCallback(() => {
    setSelectedPages(new Set());
  }, []);

  const handleDownload = useCallback(async () => {
    if (!file || !pdfBuffer || selectedPages.size === 0) return;

    const sorted = getSortedPages(selectedPages);
    const baseName = getPdfBaseName(file.name);

    try {
      if (downloadMode === 'png') {
        const pngResult = await buildPngDownloadResult({
          baseName,
          pageNumbers: sorted,
          pdfBuffer,
          scale,
        });

        download(pngResult.payload, pngResult.fileName);
        toast.success(pngResult.message);
        setImagePreviews((prev) => {
          revokeObjectUrls(prev.map((item) => item.url));
          return pngResult.imagePreviews;
        });
      } else {
        const pdfResult = await buildPdfDownloadResult({
          baseName,
          pdfBuffer,
          sortedPages: sorted,
          splitPdf: (buffer, ranges) => run((api) => api.splitPdf(buffer, ranges)),
        });
        download(pdfResult.payload, pdfResult.fileName);
        toast.success(pdfResult.message);
      }
    } catch {
      toast.error('Operation failed');
    }
  }, [download, downloadMode, file, pdfBuffer, run, scale, selectedPages]);

  const handleReset = useCallback(() => {
    revokeObjectUrls(thumbnails);
    revokeObjectUrls(imagePreviews.map((item) => item.url));
    setFile(null);
    setPdfBuffer(null);
    setTotalPages(0);
    setSelectedPages(new Set());
    setThumbnails([]);
    setImagePreviews([]);
    setDownloadMode('pdf');
  }, [imagePreviews, thumbnails]);

  useEffect(() => {
    return () => {
      revokeObjectUrls(thumbnails);
      revokeObjectUrls(imagePreviews.map((item) => item.url));
    };
  }, [imagePreviews, thumbnails]);

  return {
    clearSelectedPages,
    downloadMode,
    file,
    handleDownload,
    handleFiles,
    handleReset,
    imagePreviews,
    scale,
    selectAllPages,
    selectedPages,
    setDownloadMode,
    setScale,
    status,
    thumbnails,
    togglePage,
    totalPages,
  };
}