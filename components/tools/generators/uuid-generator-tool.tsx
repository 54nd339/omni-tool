'use client';

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CopyButton } from '@/components/shared/copy-button';

type IdType = 'uuid' | 'ulid';

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function generateUlid(): string {
  const now = Date.now();
  let t = '';
  let ts = now;
  for (let i = 0; i < 10; i++) {
    t = ENCODING[ts % 32] + t;
    ts = Math.floor(ts / 32);
  }
  let r = '';
  const rand = crypto.getRandomValues(new Uint8Array(10));
  for (let i = 0; i < 16; i++) {
    r += ENCODING[rand[i % 10] % 32];
  }
  return t + r;
}

const BATCH_SIZES = ['1', '5', '10', '50'] as const;

export function UuidGeneratorTool() {
  const searchParams = useSearchParams();
  const [idType, setIdType] = useState<IdType>('uuid');
  const [batchSize, setBatchSize] = useState('1');
  const [ids, setIds] = useState<string[]>(() => {
    const paste = searchParams.get('paste');
    return paste ? [decodeURIComponent(paste)] : [];
  });

  const generate = useCallback(() => {
    const count = parseInt(batchSize);
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(idType === 'uuid' ? crypto.randomUUID() : generateUlid());
    }
    setIds(result);
  }, [idType, batchSize]);

  const copyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ids.join('\n'));
      toast.success('All IDs copied');
    } catch {
      toast.error('Failed to copy');
    }
  }, [ids]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Type</p>
          <ToggleGroup
            type="single"
            value={idType}
            onValueChange={(v) => v && setIdType(v as IdType)}
          >
            <ToggleGroupItem value="uuid">UUID v4</ToggleGroupItem>
            <ToggleGroupItem value="ulid">ULID</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Batch</p>
          <ToggleGroup
            type="single"
            value={batchSize}
            onValueChange={(v) => v && setBatchSize(v)}
          >
            {BATCH_SIZES.map((s) => (
              <ToggleGroupItem key={s} value={s}>
                {s}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={generate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate
        </Button>
        {ids.length > 1 && (
          <Button variant="outline" onClick={copyAll}>
            Copy All
          </Button>
        )}
      </div>

      {ids.length > 0 && (
        <div className="space-y-1">
          {ids.map((id, i) => (
            <div
              key={`${id}-${i}`}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <code className="text-sm break-all">{id}</code>
              <CopyButton value={id} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
