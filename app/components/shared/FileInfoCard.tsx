import { type FC } from 'react';
import { formatFileSize, cn } from '@/app/lib/utils';
import type { FileInfoCardProps } from '@/app/lib/types';

export const FileInfoCard: FC<FileInfoCardProps> = ({
  fileName,
  fileSize,
  additionalInfo,
  className,
}) => {
  return (
    <div className={cn('mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg', className)}>
      <div className="flex justify-between items-start">
        <div className="text-left">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {fileName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {formatFileSize(fileSize, 'MB')}
          </p>
        </div>
        {additionalInfo && (
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            {additionalInfo}
          </div>
        )}
      </div>
    </div>
  );
};

