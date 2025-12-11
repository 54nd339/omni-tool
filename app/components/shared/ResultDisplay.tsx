import { FC, ReactNode, useCallback } from 'react';
import { CopyButton } from './CopyButton';
import { useClipboard } from '@/app/lib/hooks';
import { cn } from '@/app/lib/utils';

interface ResultDisplayProps {
  value: string;
  label?: string;
  className?: string;
  copyButtonLabel?: string;
  children?: ReactNode;
}

export const ResultDisplay: FC<ResultDisplayProps> = ({
  value,
  label = 'Result',
  className,
  copyButtonLabel = 'Copy Result',
  children,
}) => {
  const clipboard = useClipboard();
  
  const handleCopy = useCallback(async () => {
    if (value) {
      await clipboard.copy(value);
    }
  }, [value, clipboard]);

  if (!value && !children) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
        {children || (
          <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{value}</pre>
        )}
      </div>
      {value && (
        <CopyButton
          value={value}
          onCopy={handleCopy}
          copied={clipboard.copied}
          disabled={!value}
          label={copyButtonLabel}
        />
      )}
    </div>
  );
};

