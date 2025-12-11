'use client';

import { Film } from 'lucide-react';
import { MEDIA_TOOLS } from '@/app/lib/constants';
import { DashboardLayout } from '@/app/components/shared';

export default function MediaDashboard() {
  return (
    <DashboardLayout
      icon={Film}
      title="Audio/Video Lab"
      description="Process and convert media files"
      tools={MEDIA_TOOLS}
      colorTheme={{
        iconBg: 'bg-teal-100 dark:bg-teal-900/20',
        iconColor: 'text-teal-500',
        hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-700',
        hoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
      }}
    />
  );
}
