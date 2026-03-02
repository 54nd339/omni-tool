'use client';

import { memo } from 'react';
import { X } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

interface FilePreviewProps {
  name: string;
  size: number;
  preview?: string;
  onRemove?: () => void;
  className?: string;
}

export const FilePreview = memo(function FilePreview({
  name,
  size,
  preview,
  onRemove,
  className,
}: FilePreviewProps) {
  return (
    <div
      className={cn(
        'relative flex items-center gap-3 rounded-md border border-border p-3',
        className,
      )}
    >
      {preview && (
        <img
          src={preview}
          alt={name}
          className="h-12 w-12 shrink-0 rounded-md object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(size)}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label="Remove file"
          className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
