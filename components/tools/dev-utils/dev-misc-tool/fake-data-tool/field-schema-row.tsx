'use client';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FIELD_TYPES,
  type FieldSchema,
  type FieldType,
} from '@/lib/dev-utils/fake-data';
import { cn } from '@/lib/utils';

interface FieldSchemaRowProps {
  canRemove: boolean;
  field: FieldSchema;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FieldSchema>) => void;
}

export function FieldSchemaRow({
  canRemove,
  field,
  onRemove,
  onUpdate,
}: FieldSchemaRowProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/20 p-3">
      <div className="min-w-[140px] flex-1">
        <label className="mb-1 block text-xs text-muted-foreground">Name</label>
        <Input
          value={field.name}
          onChange={(event) => onUpdate(field.id, { name: event.target.value })}
          placeholder="field_name"
          className="h-9"
        />
      </div>
      <div className="min-w-[160px] flex-1">
        <label className="mb-1 block text-xs text-muted-foreground">Type</label>
        <Select
          value={field.type}
          onValueChange={(value) => onUpdate(field.id, { type: value as FieldType })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {(field.type === 'Integer' || field.type === 'Float') && (
        <>
          <div className="w-20">
            <label className="mb-1 block text-xs text-muted-foreground">Min</label>
            <Input
              type="number"
              value={field.min ?? ''}
              onChange={(event) =>
                onUpdate(field.id, {
                  min: event.target.value === '' ? undefined : Number(event.target.value),
                })
              }
              placeholder="0"
              className="h-9"
            />
          </div>
          <div className="w-20">
            <label className="mb-1 block text-xs text-muted-foreground">Max</label>
            <Input
              type="number"
              value={field.max ?? ''}
              onChange={(event) =>
                onUpdate(field.id, {
                  max: event.target.value === '' ? undefined : Number(event.target.value),
                })
              }
              placeholder="100"
              className="h-9"
            />
          </div>
        </>
      )}
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-9 w-9 shrink-0', !canRemove && 'invisible')}
        onClick={() => onRemove(field.id)}
        aria-label="Remove field"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
