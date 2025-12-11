'use client';

import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
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

export default function RepairPage() {
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
    try {
      const doc = await PDFDocument.load(buffer);
      setPdf({ file, name: file.name, pages: doc.getPageCount(), buffer });
      setMessage('');
    } catch (error) {
      setMessage(`Error loading PDF: ${(error as Error).message}`);
    }
  };

  const handleRepair = async () => {
    if (!pdf) return;

    setLoading(true);
    setMessage('Repairing PDF...');

    try {
      const src = await PDFDocument.load(pdf.buffer);
      const repaired = await PDFDocument.create();

      const pages = await repaired.copyPages(src, src.getPageIndices());
      pages.forEach((p) => repaired.addPage(p));

      const bytes = await repaired.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `repaired-${pdf.name}`;
      link.click();

      setMessage('✓ PDF repaired and downloaded');
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout icon={Wrench} title="Compress / Repair PDF" description="Reduce file size and fix corrupted PDFs">
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

        <Button onClick={handleRepair} loading={loading} disabled={!pdf} className="w-full">
          Repair PDF
        </Button>
      </div>
    </ToolLayout>
  );
}
