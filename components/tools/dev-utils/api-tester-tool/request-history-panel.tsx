'use client';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getStatusColor, type RequestHistoryEntry, type ResponseState } from '@/lib/dev-utils/api-tester';

interface RequestHistoryPanelProps {
  requestHistory: RequestHistoryEntry[];
  onClearHistory: () => void;
  onSelectHistory: (response: ResponseState) => void;
}

export function RequestHistoryPanel({
  requestHistory,
  onClearHistory,
  onSelectHistory,
}: RequestHistoryPanelProps) {
  return (
    <div className="rounded-md border border-border bg-muted/20 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Request History (session)</p>
        {requestHistory.length > 0 && (
          <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={onClearHistory}>
            <Trash2 className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
      </div>
      {requestHistory.length === 0 ? (
        <p className="py-2 text-center text-xs text-muted-foreground">No requests yet</p>
      ) : (
        <ul className="max-h-48 space-y-1 overflow-y-auto">
          {requestHistory.map((entry) => (
            <li key={entry.id}>
              <button
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                onClick={() => {
                  onSelectHistory({
                    status: entry.status,
                    statusText: entry.statusText,
                    headers: {},
                    body: entry.responseBody,
                    timeMs: entry.timeMs,
                    sizeBytes: new TextEncoder().encode(entry.responseBody).length,
                    ok: entry.status >= 200 && entry.status < 300,
                    isJson: entry.isJson,
                  });
                }}
              >
                <span className="w-16 shrink-0 rounded bg-muted px-1 py-0.5 text-center font-mono text-[10px] font-semibold">
                  {entry.method}
                </span>
                <span className={`shrink-0 font-mono ${getStatusColor(entry.status)}`}>
                  {entry.status}
                </span>
                <span className="truncate text-muted-foreground">
                  {entry.url.replace(/^https?:\/\//, '')}
                </span>
                <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{entry.timeMs}ms</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
