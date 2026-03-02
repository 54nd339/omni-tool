'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormatSelectorProps {
  value: string;
  onChange: (value: string) => void;
  formats: { id: string; label: string }[];
  placeholder?: string;
}

export function FormatSelector({
  value,
  onChange,
  formats,
  placeholder = 'Select format',
}: FormatSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {formats.map((f) => (
          <SelectItem key={f.id} value={f.id}>
            {f.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
