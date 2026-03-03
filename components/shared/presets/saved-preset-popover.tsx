'use client';

import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SavedPresetListItem {
  id: string;
  name: string;
}

interface SavedPresetPopoverProps<T extends SavedPresetListItem> {
  trigger: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  items: T[];
  emptyText: string;
  saveName: string;
  onSaveNameChange: (value: string) => void;
  savePlaceholder: string;
  onSave: () => void;
  saveDisabled?: boolean;
  saveButtonContent?: ReactNode;
  onLoad: (item: T) => void;
  onDelete?: (item: T) => void;
  canDelete?: (item: T) => boolean;
  renderItemSuffix?: (item: T) => ReactNode;
  getDeleteAriaLabel?: (item: T) => string;
}

export function SavedPresetPopover<T extends SavedPresetListItem>({
  trigger,
  open,
  onOpenChange,
  title,
  subtitle,
  items,
  emptyText,
  saveName,
  onSaveNameChange,
  savePlaceholder,
  onSave,
  saveDisabled,
  saveButtonContent,
  onLoad,
  onDelete,
  canDelete,
  renderItemSuffix,
  getDeleteAriaLabel,
}: SavedPresetPopoverProps<T>) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
        {subtitle && <p className="mb-2 text-xs text-muted-foreground">{subtitle}</p>}

        {items.length > 0 ? (
          <div className="mb-3 max-h-[200px] space-y-1 overflow-auto border-t border-border pt-3">
            {items.map((item) => {
              const deletable = onDelete ? (canDelete ? canDelete(item) : true) : false;

              return (
                <div
                  key={item.id}
                  className="group flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <button
                    className="flex-1 truncate text-left"
                    onClick={() => {
                      onLoad(item);
                      onOpenChange(false);
                    }}
                  >
                    {item.name}
                    {renderItemSuffix?.(item)}
                  </button>
                  {deletable && (
                    <button
                      className="shrink-0 p-1 text-muted-foreground opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 hover:text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete?.(item);
                      }}
                      aria-label={getDeleteAriaLabel?.(item) ?? `Delete ${item.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mb-3 text-xs text-muted-foreground">{emptyText}</p>
        )}

        <div className="flex items-center gap-2 border-t border-border pt-2">
          <Input
            value={saveName}
            onChange={(event) => onSaveNameChange(event.target.value)}
            placeholder={savePlaceholder}
            className="h-7 text-xs"
            onKeyDown={(event) => event.key === 'Enter' && onSave()}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 shrink-0"
            onClick={onSave}
            disabled={saveDisabled}
          >
            {saveButtonContent ?? 'Save'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}