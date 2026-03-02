'use client';

import { memo, useCallback, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useClipboardStore } from '@/stores/clipboard-store';

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: 'default' | 'sm';
  toolId?: string;
}

export const CopyButton = memo(function CopyButton({ value, className, size = 'default', toolId }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const addClip = useClipboardStore((s) => s.addClip);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      addClip(value, toolId);
      setCopied(true);
      toast.success('Copied');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Failed to copy');
    }
  }, [value, toolId, addClip]);

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const btnSize = size === 'sm' ? 'h-6 w-6' : undefined;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(btnSize, className)}
      onClick={handleCopy}
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className={cn(iconSize, 'animate-check text-green-500')} /> : <Copy className={iconSize} />}
    </Button>
  );
});
