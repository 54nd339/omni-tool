'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type HttpMethod,METHODS } from '@/lib/dev-utils/api-tester';

interface RestRequestEditorProps {
  actions: {
    onBodyChange: (value: string) => void;
    onCancelCurlImport: () => void;
    onCurlInputChange: (value: string) => void;
    onImportCurl: () => void;
    onMethodChange: (method: HttpMethod) => void;
    onSend: () => void;
    onUrlChange: (value: string) => void;
  };
  state: {
    body: string;
    curlImportOpen: boolean;
    curlInput: string;
    hasBody: boolean;
    isOnline: boolean;
    loading: boolean;
    method: HttpMethod;
    url: string;
  };
}

export function RestRequestEditor({
  actions,
  state,
}: RestRequestEditorProps) {
  const {
    body,
    curlImportOpen,
    curlInput,
    hasBody,
    isOnline,
    loading,
    method,
    url,
  } = state;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={method} onValueChange={(value) => actions.onMethodChange(value as HttpMethod)}>
          <SelectTrigger className="w-[120px] shrink-0 font-mono font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METHODS.map((item) => (
              <SelectItem key={item} value={item} className="font-mono font-bold">
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={url}
          onChange={(event) => actions.onUrlChange(event.target.value)}
          placeholder="https://api.example.com/endpoint"
          className="flex-1 font-mono text-sm"
          onKeyDown={(event) => {
            if (event.key === 'Enter') actions.onSend();
          }}
        />
        <Button onClick={actions.onSend} disabled={loading || !isOnline} className="shrink-0 px-8">
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {curlImportOpen && (
            <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">Paste a cURL command</p>
              <Textarea
                value={curlInput}
                onChange={(event) => actions.onCurlInputChange(event.target.value)}
                placeholder={"curl -X POST 'https://api.example.com/data' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"key\": \"value\"}'"}
                rows={4}
                className="font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={actions.onImportCurl} disabled={!curlInput.trim()}>
                  Import
                </Button>
                <Button size="sm" variant="ghost" onClick={actions.onCancelCurlImport}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {hasBody && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Request body</p>
              <Textarea
                value={body}
                onChange={(event) => actions.onBodyChange(event.target.value)}
                placeholder='{"key": "value"}'
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
