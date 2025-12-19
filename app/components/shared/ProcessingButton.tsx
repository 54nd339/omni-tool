import { type FC } from 'react';
import { Loader } from 'lucide-react';
import { Button } from './Button';
import type { ProcessingButtonProps } from '@/app/lib/types';

export const ProcessingButton: FC<ProcessingButtonProps> = ({
  onClick,
  disabled = false,
  processing = false,
  icon,
  processingLabel = 'Processing...',
  label,
  className = '',
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || processing}
      className={`w-full flex items-center justify-center ${className}`}
    >
      {processing ? (
        <>
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          {processingLabel}
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </Button>
  );
};

