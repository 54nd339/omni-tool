'use client';

import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';

export default function MergePage() {
  const [status] = useState('Coming soon...');

  return (
    <ToolLayout icon={Layers} title="Merge Audio/Video" description="Combine audio and video streams">
      <div className="max-w-2xl mx-auto">
        <ControlPanel title="Status">
          <p className="text-slate-600 dark:text-slate-400">{status}</p>
        </ControlPanel>
      </div>
    </ToolLayout>
  );
}
