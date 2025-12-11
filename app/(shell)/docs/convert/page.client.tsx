'use client';

import React, { useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';

export default function ConvertPage() {
  const [status] = useState('Coming soon...');

  return (
    <ToolLayout icon={Repeat2} title="Format Converter" description="Convert PDF to DOCX, XLSX, PPTX, and other formats">
      <div className="max-w-2xl mx-auto">
        <ControlPanel title="Status">
          <p className="text-slate-600 dark:text-slate-400">{status}</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            Requires LibreOffice WASM or similar conversion library.
          </p>
        </ControlPanel>
      </div>
    </ToolLayout>
  );
}
