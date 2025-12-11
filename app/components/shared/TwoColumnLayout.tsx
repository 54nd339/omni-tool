'use client';

import { type FC } from 'react';
import { cn } from '@/app/lib/utils';
import { TwoColumnLayoutProps } from '@/app/lib/types';

export const TwoColumnLayout: FC<TwoColumnLayoutProps> = ({
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
