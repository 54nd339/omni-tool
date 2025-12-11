'use client';

import { FileText } from 'lucide-react';
import { DOCS_TOOLS } from '@/app/lib/constants';
import { DashboardLayout } from '@/app/components/shared';

export default function DocsDashboard() {
  return (
    <DashboardLayout
      icon={FileText}
      title="PDF + Docs"
      description="Manage and convert documents"
      tools={DOCS_TOOLS}
      colorTheme={{
        iconBg: 'bg-orange-100 dark:bg-orange-900/20',
        iconColor: 'text-orange-500',
        hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-700',
        hoverText: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
      }}
    />
  );
}
