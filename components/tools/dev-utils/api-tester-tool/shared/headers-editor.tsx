'use client';

import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type HeaderRow } from '@/types/dev-utils';

interface SharedHeadersEditorProps {
  headers: HeaderRow[];
  onAddHeader: () => void;
  onRemoveHeader: (id: string) => void;
  onToggleOpen: () => void;
  onUpdateHeader: (id: string, field: 'key' | 'value', value: string) => void;
  open: boolean;
}

export function SharedHeadersEditor({
  headers,
  onAddHeader,
  onRemoveHeader,
  onToggleOpen,
  onUpdateHeader,
  open,
}: SharedHeadersEditorProps) {
  const hasValues = headers.length > 1 || headers[0]?.key !== '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex items-center gap-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Headers {hasValues ? `(${headers.length})` : ''}
        </button>
        <Button variant="ghost" size="sm" onClick={onAddHeader} className="h-7 text-xs">
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>
      {open && (
        <div className="space-y-2">
          {headers.map((header) => (
            <div key={header.id} className="grid w-full grid-cols-[1fr_2fr_auto] items-center gap-2">
              <Input
                value={header.key}
                onChange={(event) => onUpdateHeader(header.id, 'key', event.target.value)}
                placeholder="Header name"
                className="font-mono text-sm"
              />
              <Input
                value={header.value}
                onChange={(event) => onUpdateHeader(header.id, 'value', event.target.value)}
                placeholder="Value"
                className="font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveHeader(header.id)}
                aria-label="Remove header"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
