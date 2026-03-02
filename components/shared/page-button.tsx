import { memo } from 'react';
import { cn } from '@/lib/utils';

interface PageButtonProps {
  page: number;
  label?: string | number;
  selected: boolean;
  onToggle: (page: number) => void;
}

export const PageButton = memo(function PageButton({
  page,
  label,
  selected,
  onToggle,
}: PageButtonProps) {
  return (
    <button
      onClick={() => onToggle(page)}
      aria-label={`Page ${page + 1}`}
      className={cn(
        'h-10 w-10 rounded-md border text-sm transition-colors',
        selected
          ? 'border-foreground bg-muted font-medium'
          : 'border-border text-muted-foreground hover:bg-muted/50',
      )}
    >
      {label ?? page + 1}
    </button>
  );
});
