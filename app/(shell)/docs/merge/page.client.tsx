'use client';

import React, { useRef, useState } from 'react';
import { Layers, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { FileUpload } from '@/app/components/shared/FileUpload';
import { Button } from '@/app/components/shared/Button';

interface LoadedPdf {
  file: File;
  name: string;
  pages: number;
  buffer: ArrayBuffer;
}

export default function MergePage() {
  const [files, setFiles] = useState<LoadedPdf[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const pdfs: LoadedPdf[] = [];
    for (const file of selectedFiles) {
      if (!file.type.includes('pdf')) {
        alert('Only PDF files are supported');
        continue;
      }
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      pdfs.push({ file, name: file.name, pages: doc.getPageCount(), buffer });
    }
    setFiles((prev) => [...prev, ...pdfs]);
    setMessage('');
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setMessage('Add at least two PDFs to merge');
      return;
    }

    setLoading(true);
    setMessage('Merging PDFs...');

    try {
      const merged = await PDFDocument.create();
      for (const pdfFile of files) {
        const src = await PDFDocument.load(pdfFile.buffer);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }

      const bytes = await merged.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.click();

      setMessage('✓ PDFs merged successfully');
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ToolLayout icon={Layers} title="Merge PDFs" description="Combine multiple PDF files into one">
      <div className="space-y-4">
        <FileUpload label="Add PDF files" accept=".pdf" multiple onFilesSelected={handleFilesSelected} />

        {files.length > 0 && (
          <ControlPanel title={`Selected Files (${files.length})`}>
            <div className="space-y-2">
              {files.map((pdf, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{pdf.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{pdf.pages} pages</p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-xs font-medium text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </ControlPanel>
        )}

        {message && (
          <ControlPanel title="Status">
            <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p>
          </ControlPanel>
        )}

        <Button onClick={handleMerge} loading={loading} disabled={files.length < 2} className="w-full">
          Merge PDFs
        </Button>
      </div>
    </ToolLayout>
  );
}
