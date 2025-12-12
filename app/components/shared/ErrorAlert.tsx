import { AlertCircle } from 'lucide-react';
import { ErrorAlertProps } from '@/app/lib/types';

export const ErrorAlert = ({ error, className = '' }: ErrorAlertProps) => {
  if (!error) return null;

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
      </div>
    </div>
  );
};
