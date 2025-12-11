'use client';

import { Code } from 'lucide-react';
import { DEV_TOOLS } from '@/app/lib/constants';
import { DashboardLayout } from '@/app/components/shared';

export default function DevDashboard() {
  return (
    <DashboardLayout
      icon={Code}
      title="Dev Utilities"
      description="Essential tools for developers"
      tools={DEV_TOOLS}
      colorTheme={{
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/20',
        iconColor: 'text-emerald-500',
        hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
        hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
      }}
    />
  );
}
