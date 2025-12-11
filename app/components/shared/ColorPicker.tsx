'use client';

import { FC, InputHTMLAttributes } from 'react';
import { cn } from '@/app/lib/utils';

interface ColorPickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const ColorPicker: FC<ColorPickerProps> = ({
  label,
  helperText,
  error,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}
      <input
        type="color"
        className={cn(
          'h-9 w-full rounded border border-slate-300 dark:border-slate-700 cursor-pointer',
          error && 'border-red-500 dark:border-red-500',
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

