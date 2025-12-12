'use client';

import { FC } from 'react';
import { cn } from '@/app/lib/utils';
import { CheckboxProps } from '@/app/lib/types';

export const Checkbox: FC<CheckboxProps> = ({
  label,
  helperText,
  error,
  className,
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={checkboxId}
          className={cn(
            'w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500',
            error && 'border-red-500 dark:border-red-500',
            className
          )}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            {label}
          </label>
        )}
      </div>
      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">{helperText}</p>
      )}
      {error && <p className="text-sm text-red-500 ml-6">{error}</p>}
    </div>
  );
};
