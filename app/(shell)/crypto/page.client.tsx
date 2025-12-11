'use client';

import { Lock } from 'lucide-react';
import { CRYPTO_TOOLS } from '@/app/lib/constants';
import { DashboardLayout } from '@/app/components/shared';

export default function CryptoDashboard() {
  return (
    <DashboardLayout
      icon={Lock}
      title="Cryptography"
      description="Hash, encrypt, and encode data securely"
      tools={CRYPTO_TOOLS}
      colorTheme={{
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/20',
        iconColor: 'text-indigo-500',
        hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700',
        hoverText: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
      }}
    />
  );
}
