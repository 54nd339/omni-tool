import { type FC } from 'react';
import { ErrorAlert } from './ErrorAlert';
import { ProgressBar } from './ProgressBar';
import { SuccessResult } from './SuccessResult';
import { cn } from '@/app/lib/utils';
import type { ProcessingResultPanelProps } from '@/app/lib/types';

export const ProcessingResultPanel: FC<ProcessingResultPanelProps> = ({
  error,
  processing = false,
  progress = 0,
  progressLabel = 'Processing...',
  result,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {error && <ErrorAlert error={error} />}
      {processing && <ProgressBar progress={progress} label={progressLabel} />}
      {result && result.title && result.message && result.onDownload && (
        <SuccessResult
          title={result.title}
          message={result.message}
          onDownload={result.onDownload}
          downloadLabel={result.downloadLabel}
        />
      )}
      {children}
    </div>
  );
};

