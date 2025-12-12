import { ProgressBarProps } from '@/app/lib/types';

export const ProgressBar = ({ progress, label = 'Processing...', className = '' }: ProgressBarProps) => {
  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-700 dark:text-blue-200">{label}</span>
          <span className="text-blue-700 dark:text-blue-200">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
