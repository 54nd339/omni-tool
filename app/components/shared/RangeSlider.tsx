'use client';

import { FC, InputHTMLAttributes } from 'react';
import { cn } from '@/app/lib/utils';

interface RangeSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue?: string | number;
  helperText?: string;
  error?: string;
}

export const RangeSlider: FC<RangeSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  displayValue,
  helperText,
  error,
  className,
  ...props
}) => {
  const display = displayValue !== undefined ? displayValue : value;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label} {typeof display === 'number' ? `(${display})` : `(${display})`}
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className={cn('w-full', className)}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

