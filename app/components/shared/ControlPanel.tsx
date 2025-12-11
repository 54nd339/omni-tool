'use client';

import { type FC } from 'react';
import { cn } from '@/app/lib/utils';
import { ControlPanelProps } from '@/app/lib/types';

export const ControlPanel: FC<ControlPanelProps> = ({ title, children, className }) => {
  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4', className)}>
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
};
