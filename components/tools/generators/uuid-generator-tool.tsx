'use client';

import { useCallback, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToolParams } from '@/hooks/use-tool-params';
import { UUID_BATCH_SIZES } from '@/lib/constants/generators';
import { generateId } from '@/lib/generators';
import type { IdType } from '@/types/common';

const PARAM_DEFAULTS = {
  batchSize: '1',
  idType: 'uuid',
};

export function UuidGeneratorTool() {
  const [params, setParams] = useToolParams(PARAM_DEFAULTS);
  const [ids, setIds] = useState<string[]>([]);

  const idType: IdType = params.idType === 'ulid' ? 'ulid' : 'uuid';
  const batchSize = params.batchSize;

  const generate = useCallback(() => {
    const count = parseInt(batchSize);
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(generateId(idType));
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
            onValueChange={(value) => value && setParams({ idType: value })}
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
            onValueChange={(value) => value && setParams({ batchSize: value })}
          >
            {UUID_BATCH_SIZES.map((s) => (
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
