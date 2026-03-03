import { CopyButton } from '@/components/shared/tool-actions/copy-button';

interface ResultsListProps {
  values: string[];
}

export function ResultsList({ values }: ResultsListProps) {
  if (values.length === 0) return null;

  return (
    <div className="space-y-1">
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="flex items-center justify-between rounded-md border border-border px-3 py-2"
        >
          <code className="break-all text-sm">{value}</code>
          <CopyButton value={value} size="sm" />
        </div>
      ))}
    </div>
  );
}
