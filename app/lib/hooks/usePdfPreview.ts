import { useEffect, useRef, useState, useCallback } from 'react';
import { renderPdfPreview, renderPdfPage, getPdfPageCount } from '@/app/lib/tools';
import { LoadedPdf, PdfPreviewResult } from '@/app/lib/types';

export function usePdfPreview(pdf: LoadedPdf | null): PdfPreviewResult {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [totalPages, setTotalPages] = useState(pdf?.pages || 0);
  const [currentPage, setCurrentPageState] = useState(1);

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPageState(validPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const reset = useCallback(() => {
    setCurrentPageState(1);
  }, []);

  const renderPreview = useCallback(async () => {
    if (!pdf || !canvasRef.current) return;

    try {
      if (currentPage === 1) {
        await renderPdfPreview(pdf.buffer, canvasRef.current);
        const pages = await getPdfPageCount(pdf.buffer);
        setTotalPages(pages);
      } else {
        await renderPdfPage(pdf.buffer, currentPage, canvasRef.current);
      }
    } catch (error) {
      console.error('PDF preview error:', error);
    }
  }, [pdf, currentPage]);

  useEffect(() => {
    if (pdf) {
      setTotalPages(pdf.pages);
    }
  }, [pdf]);

  useEffect(() => {
    if (pdf && canvasRef.current) {
      renderPreview();
    }
  }, [pdf, currentPage, renderPreview]);

  return {
    canvasRef,
    currentPage,
    totalPages,
    setCurrentPage: goToPage,
    nextPage,
    prevPage,
    reset,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
    renderPreview,
  };
}
