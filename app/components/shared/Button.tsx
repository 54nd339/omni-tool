'use client';

import { type FC } from 'react';
import { cn } from '@/app/lib/utils';
import { BUTTON_VARIANTS, BUTTON_SIZES } from '@/app/lib/constants';
import { ButtonProps } from '@/app/lib/types';

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
