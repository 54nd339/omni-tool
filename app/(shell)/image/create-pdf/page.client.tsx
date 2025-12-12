'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { ToolLayout, FileUpload, Button, DraggableList, ErrorAlert, PdfPreview } from '@/app/components/shared';
import { createPdfFromImages, renderPdfPreview } from '@/app/lib/tools';
import { normalizeImageToPng, loadImageFile, downloadBlob, validateImageFile } from '@/app/lib/utils';
import { useFileUpload, useLoadingMessage } from '@/app/lib/hooks';
import type { ImageFile } from '@/app/lib/types';

export default function CreatePdfPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { loading, execute } = useLoadingMessage();

  const { error: fileError, handleFilesSelected } = useFileUpload<ImageFile>({
    accept: 'image/*',
    maxFiles: Infinity,
    validator: validateImageFile,
    onFilesSelected: async (validFiles: File[]) => {
      try {
        const imagePromises = validFiles.map(async (file) => {
          const normalizedBlob = await normalizeImageToPng(file);
          return loadImageFile(file, normalizedBlob);
        });

        const loadedImages = await Promise.all(imagePromises);
        setImages((prev) => [...prev, ...loadedImages]);
        setPdfBlob(null);
        return loadedImages;
      } catch (error) {
        throw error;
      }
    },
  });

  const handleCreatePdf = useCallback(async () => {
    if (!images.length) {
      return;
    }

    const result = await execute(
      async () => {
        const blob = await createPdfFromImages(images);
        setPdfBlob(blob);
        return blob;
      },
      `✓ PDF created from ${images.length} image${images.length > 1 ? 's' : ''}`
    );
    if (!result) {
      setPdfBlob(null);
    }
  }, [images, execute]);

  const downloadPdf = useCallback(() => {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, 'document.pdf');
  }, [pdfBlob]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPdfBlob(null);
  }, []);

  const reorderImages = useCallback((reorderedImages: ImageFile[]) => {
    setImages(reorderedImages);
    setPdfBlob(null);
  }, []);

  useEffect(() => {
    const renderPreview = async () => {
      if (pdfBlob && canvasRef.current) {
        try {
          const arrayBuffer = await pdfBlob.arrayBuffer();
          await renderPdfPreview(arrayBuffer, canvasRef.current);
          setTotalPages(images.length);
        } catch (error) {
          console.error('PDF preview error:', error);
        }
      }
    };
    renderPreview();
  }, [pdfBlob, images.length]);

  return (
    <ToolLayout path="/image/create-pdf">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FileUpload
            label="Add Images"
            accept="image/*"
            multiple
            onFilesSelected={handleFilesSelected}
          />

          {images.length > 0 && (
            <DraggableList
              items={images}
              onReorder={reorderImages}
              onRemove={removeImage}
              title={`Selected Images (${images.length})`}
              renderMetadata={(img) => (
                <>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{img.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{img.width}×{img.height}px</p>
                </>
              )}
            />
          )}

          {fileError && <ErrorAlert error={fileError} />}

          <Button
            onClick={handleCreatePdf}
            loading={loading}
            disabled={images.length === 0}
            className="w-full flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Create PDF
          </Button>
        </div>

        <div className="space-y-4">
          <PdfPreview
            canvasRef={canvasRef}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isLoaded={!!pdfBlob}
            hasSource={!!pdfBlob}
            label="PDF Preview"
          />

          {pdfBlob && (
            <Button
              onClick={downloadPdf}
              className="w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
