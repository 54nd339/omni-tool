'use client';

import React from 'react';
import { cn } from '@/app/utils/cn';

interface ControlPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * DRY control panel for grouping settings/options
 */
export const ControlPanel: React.FC<ControlPanelProps> = ({ title, children, className }) => {
  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4', className)}>
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
};
