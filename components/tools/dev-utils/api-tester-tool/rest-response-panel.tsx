'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { SendToButton } from '@/components/shared/tool-actions/send-to-button';
import { Textarea } from '@/components/ui/textarea';
import { getStatusColor, type ResponseState } from '@/lib/dev-utils/api-tester';
import { formatBytes } from '@/lib/utils';

interface RestResponsePanelProps {
  loading: boolean;
  response: ResponseState | null;
  responseHeadersOpen: boolean;
  onToggleResponseHeaders: () => void;
}

export function RestResponsePanel({
  loading,
  response,
  responseHeadersOpen,
  onToggleResponseHeaders,
}: RestResponsePanelProps) {
  if (!response && !loading) {
    return (
      <div className="flex h-[350px] flex-col items-center justify-center rounded-md border border-dashed border-border py-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">No response yet</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Enter a URL and click Send to make a request</p>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className={`font-mono font-semibold ${getStatusColor(response.status)}`}>
          {response.status > 0 ? response.status : '—'} {response.statusText}
        </span>
        <span className="text-xs text-muted-foreground">
          {response.timeMs} ms · {formatBytes(response.sizeBytes)}
        </span>
        {response.body && (
          <>
            <SendToButton value={response.body} outputType={response.isJson ? 'json' : 'text'} />
            <CopyButton value={response.body} size="sm" />
          </>
        )}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onToggleResponseHeaders}
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
        <Textarea value={response.body} readOnly rows={16} className="resize-none bg-muted/50 font-mono text-sm" />
      </div>
    </div>
  );
}
