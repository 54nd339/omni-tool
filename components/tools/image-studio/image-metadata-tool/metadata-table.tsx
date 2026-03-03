import { CopyButton } from '@/components/shared/tool-actions/copy-button';

interface MetadataTableProps {
  entries: { label: string; value: string; key: string }[];
}

export function MetadataTable({ entries }: MetadataTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid gap-0 divide-y divide-border">
        {entries.map(({ label, value, key }) => (
          <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              <span className="truncate text-right font-mono text-sm">{value}</span>
              <CopyButton value={value} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
