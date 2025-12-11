'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { ToolLayout, ControlPanel, FileUpload, Button, PdfPreview, ErrorAlert, Select, RangeSlider } from '@/app/components/shared';
import { convertPdfToImages, loadPdf } from '@/app/lib/tools';
import { downloadImagesAsZip, validatePdfFile } from '@/app/lib/utils';
import { useFileUpload, usePdfPreview, useLoadingMessage } from '@/app/lib/hooks';
import { LoadedPdf, PdfImageFormat } from '@/app/lib/types';
import { DOCS_DEFAULTS, PDF_IMAGE_FORMAT_OPTIONS } from '@/app/lib/constants';

export default function ConvertPage() {
  const [format, setFormat] = useState<PdfImageFormat>(DOCS_DEFAULTS.PDF_IMAGE_FORMAT);
  const [quality, setQuality] = useState(0.92);
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const { loading, execute } = useLoadingMessage();

  const { file, error: fileError, handleFilesSelected } = useFileUpload<LoadedPdf>({
    accept: '.pdf',
    validator: validatePdfFile,
    transformFile: async (selectedFile) => {
      return await loadPdf(selectedFile);
    },
  });

  const { canvasRef, currentPage, totalPages, setCurrentPage } = usePdfPreview(file);

  const handleConvert = async () => {
    if (!file) return;
    const result = await execute(
      async () => {
        const convertedBlobs = await convertPdfToImages(file.buffer, format, quality, totalPages);
        setBlobs(convertedBlobs);
        return convertedBlobs;
      },
      `✓ Converted ${totalPages} pages to ${format.toUpperCase()}`
    );
    if (!result) {
      setBlobs([]);
    }
  };

  const downloadImages = async () => {
    const fileName = `${file?.name.replace('.pdf', '')}-images.zip` || 'images.zip';
    await downloadImagesAsZip(blobs, format, fileName);
  };

  return (
    <ToolLayout path="/docs/convert">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FileUpload label="Upload PDF" accept=".pdf" onFilesSelected={handleFilesSelected} />

          {file && (
            <ControlPanel title="PDF Info">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>{file.name}</strong>
                {totalPages > 0 && ` - ${totalPages} pages`}
              </p>
            </ControlPanel>
          )}

          <ControlPanel title="Output Settings">
            <div className="space-y-3">
              <Select
                label="Format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as PdfImageFormat)}
                >
                  {PDF_IMAGE_FORMAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </Select>

              {format !== 'png' && (
                <RangeSlider
                  label="Quality"
                    value={quality}
                  min={0.1}
                  max={1}
                  step={0.01}
                  displayValue={`${Math.round(quality * 100)}%`}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                  />
              )}
            </div>
          </ControlPanel>

          {fileError && <ErrorAlert error={fileError} />}

          <Button onClick={handleConvert} loading={loading} disabled={!file} className="w-full flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Convert to Images
          </Button>
        </div>

        <div className="space-y-4">
          <PdfPreview
            canvasRef={canvasRef}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isLoaded={!!file}
          />

          {blobs.length > 0 && (
            <Button onClick={downloadImages} className="w-full flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download All Images ({blobs.length})
            </Button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
