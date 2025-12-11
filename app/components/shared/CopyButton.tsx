import { type FC } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './Button';
import type { CopyButtonProps } from '@/app/lib/types';

export const CopyButton: FC<CopyButtonProps> = ({
  value: _value,
  onCopy,
  copied,
  disabled,
  className = 'w-full',
  label = 'Copy Result',
}) => {
  return (
    <Button
      variant="outline"
      onClick={onCopy}
      className={`${className} flex items-center justify-center gap-2`}
      disabled={disabled}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {label}
        </>
      )}
    </Button>
  );
};
