'use client';

import { useCallback, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESETS = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleInput = useCallback(
    (v: string) => {
      setInputValue(v);
      if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
    },
    [onChange],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Pick color"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md border border-border',
            className,
          )}
        >
          <span
            className="h-5 w-5 rounded-sm border border-border"
            style={{ background: value }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid grid-cols-5 gap-2">
          {PRESETS.map((c) => (
            <button
              key={c}
              aria-label={`Select color ${c}`}
              className={cn(
                'h-7 w-7 rounded-md border border-border transition-transform hover:scale-110',
                value === c && 'ring-2 ring-ring',
              )}
              style={{ background: c }}
              onClick={() => {
                onChange(c);
                setInputValue(c);
              }}
            />
          ))}
        </div>
        <Input
          value={inputValue}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="#000000"
          className="mt-3"
        />
      </PopoverContent>
    </Popover>
  );
}
