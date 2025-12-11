import { CheckCircle, Download } from 'lucide-react';
import { Button } from './Button';

interface SuccessResultProps {
  title?: string;
  message: string;
  onDownload: () => void;
  downloadLabel?: string;
  className?: string;
}

export const SuccessResult = ({
  title = 'Complete!',
  message,
  onDownload,
  downloadLabel = 'Download',
  className = '',
}: SuccessResultProps) => {
  return (
    <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3 ${className}`}>
      <div className="flex items-start gap-2">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-700 dark:text-green-200">{title}</p>
          <p className="text-sm text-green-600 dark:text-green-300 mt-1">{message}</p>
        </div>
      </div>
      <Button
        onClick={onDownload}
        className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center"
      >
        <Download className="w-4 h-4 mr-2" />
        {downloadLabel}
      </Button>
    </div>
  );
};

