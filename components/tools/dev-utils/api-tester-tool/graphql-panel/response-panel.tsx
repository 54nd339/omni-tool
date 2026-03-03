'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Textarea } from '@/components/ui/textarea';
import type { GqlResponse } from '@/lib/dev-utils/graphql-panel';

interface ResponsePanelProps {
  responseHeadersOpen: boolean;
  onToggleResponseHeadersOpen: () => void;
  response: GqlResponse;
}

export function ResponsePanel({
  responseHeadersOpen,
  onToggleResponseHeadersOpen,
  response,
}: ResponsePanelProps) {
  const statusColor = response.ok
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className={`font-mono font-semibold ${statusColor}`}>
          {response.status > 0 ? response.status : '—'} {response.statusText}
        </span>
        <span className="text-xs text-muted-foreground">{response.timeMs} ms</span>
        {response.body && <CopyButton value={response.body} size="sm" />}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onToggleResponseHeadersOpen}
          className="flex items-center gap-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {responseHeadersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Response headers
        </button>
        {responseHeadersOpen && Object.keys(response.headers).length > 0 && (
          <div className="rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-2 py-0.5">
                <span className="text-muted-foreground">{key}:</span>
                <span className="break-all">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Response body</p>
        <Textarea
          value={response.body}
          readOnly
          rows={16}
          className="resize-none bg-muted/50 font-mono text-sm"
        />
      </div>
    </div>
  );
}
