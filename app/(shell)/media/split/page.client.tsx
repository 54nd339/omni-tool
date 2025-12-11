'use client';

import React, { useState } from 'react';
import { Scissors } from 'lucide-react';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';

export default function SplitPage() {
  const [status] = useState('Coming soon...');

  return (
    <ToolLayout icon={Scissors} title="Split Audio/Video" description="Trim or split audio/video files">
      <div className="max-w-2xl mx-auto">
        <ControlPanel title="Status">
          <p className="text-slate-600 dark:text-slate-400">{status}</p>
        </ControlPanel>
      </div>
    </ToolLayout>
  );
}
