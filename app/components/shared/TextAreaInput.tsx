import { type FC } from 'react';
import { cn } from '@/app/lib/utils';
import { TextAreaInputProps } from '@/app/lib/types';

export const TextAreaInput: FC<TextAreaInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 8,
  readOnly = false,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        className={cn(
          'w-full px-3 py-2 border rounded-lg font-mono text-sm',
          'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
          'border-slate-300 dark:border-slate-600',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors',
          readOnly && 'bg-slate-50 dark:bg-slate-950 cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
