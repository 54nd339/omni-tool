'use client';

import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';

export default function RepairPage() {
  const [status] = useState('Coming soon...');

  return (
    <ToolLayout icon={Wrench} title="Repair Audio/Video" description="Fix corrupted media files">
      <div className="max-w-2xl mx-auto">
        <ControlPanel title="Status">
          <p className="text-slate-600 dark:text-slate-400">{status}</p>
        </ControlPanel>
      </div>
    </ToolLayout>
  );
}
