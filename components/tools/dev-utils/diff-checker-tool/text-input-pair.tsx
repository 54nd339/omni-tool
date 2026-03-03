'use client';

import { Textarea } from '@/components/ui/textarea';

interface TextInputPairProps {
  left: string;
  right: string;
  onLeftChange: (value: string) => void;
  onRightChange: (value: string) => void;
}

export function TextInputPair({ left, right, onLeftChange, onRightChange }: TextInputPairProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Original</p>
        <Textarea
          value={left}
          onChange={(event) => onLeftChange(event.target.value)}
          rows={14}
          className="font-mono text-sm"
          placeholder="Paste original text..."
          autoFocus
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Modified</p>
        <Textarea
          value={right}
          onChange={(event) => onRightChange(event.target.value)}
          rows={14}
          className="font-mono text-sm"
          placeholder="Paste modified text..."
        />
      </div>
    </div>
  );
}
