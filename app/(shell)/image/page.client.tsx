'use client';

import { Image as ImageIcon } from 'lucide-react';
import { IMAGE_TOOLS } from '@/app/lib/constants';
import { DashboardLayout } from '@/app/components/shared';

export default function ImageDashboard() {
  return (
    <DashboardLayout
      icon={ImageIcon}
      title="Image Tools"
      description="Process, edit, and convert images"
      tools={IMAGE_TOOLS}
      colorTheme={{
        iconBg: 'bg-pink-100 dark:bg-pink-900/20',
        iconColor: 'text-pink-500',
        hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-700',
        hoverText: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
      }}
    />
  );
}
