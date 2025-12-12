import { FC } from 'react';
import { cn } from '@/app/lib/utils';
import { RadioGroupProps } from '@/app/lib/types';

export const RadioGroup: FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  className,
  error,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-start gap-3 cursor-pointer"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className={cn(
              'mt-1 w-4 h-4 border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500',
              error && 'border-red-500 dark:border-red-500'
            )}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {option.label}
            </p>
            {option.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {option.description}
              </p>
            )}
          </div>
        </label>
      ))}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
