'use client';

import React from 'react';
import { cn } from '@/app/utils/cn';

interface TwoColumnLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  reverseOnMobile?: boolean;
}

/**
 * DRY two-column layout for tools with input/output or preview
 */
export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  left,
  right,
  className,
  reverseOnMobile = false,
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-2 gap-6',
        reverseOnMobile && 'lg:grid-cols-2 lg:flex-row-reverse',
        className,
      )}
    >
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
};
