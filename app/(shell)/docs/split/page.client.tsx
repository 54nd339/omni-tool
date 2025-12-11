'use client';

import React, { useState } from 'react';
import { Scissors, Download } from 'lucide-react';
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

export default function SplitPage() {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFilesSelected = async (files: File[]) => {
    const file = files[0];
    if (!file.type.includes('pdf')) {
      alert('Only PDF files are supported');
      return;
    }

    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer);
    setPdf({ file, name: file.name, pages: doc.getPageCount(), buffer });
    setMessage('');
  };

  const handleSplit = async () => {
    if (!pdf) return;

    setLoading(true);
    setMessage('Splitting PDF...');

    try {
      const src = await PDFDocument.load(pdf.buffer);
      for (const idx of src.getPageIndices()) {
        const out = await PDFDocument.create();
        const [page] = await out.copyPages(src, [idx]);
        out.addPage(page);
        const bytes = await out.save();

        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `page-${idx + 1}.pdf`;
        link.click();
      }
      setMessage(`✓ Split ${pdf.pages} pages`);
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout icon={Scissors} title="Split PDF" description="Extract individual pages from a PDF">
      <div className="space-y-4 max-w-2xl">
        <FileUpload label="Upload PDF" accept=".pdf" onFilesSelected={handleFilesSelected} />

        {pdf && (
          <ControlPanel title="Loaded PDF">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>{pdf.name}</strong> - {pdf.pages} pages
            </p>
          </ControlPanel>
        )}

        {message && (
          <ControlPanel title="Status">
            <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p>
          </ControlPanel>
        )}

        <Button onClick={handleSplit} loading={loading} disabled={!pdf} className="w-full">
          Split Pages
        </Button>
      </div>
    </ToolLayout>
  );
}
