'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGraphqlClient } from '@/hooks/use-graphql-client';

import { SharedHeadersEditor } from '../shared/headers-editor';
import { ResponsePanel } from './response-panel';

export function GraphqlPanel() {
  const {
    addHeader,
    handleIntrospect,
    handleRun,
    headers,
    responseHeadersOpen,
    loading,
    query,
    removeHeader,
    requestHeadersOpen,
    response,
    setResponseHeadersOpen,
    setQuery,
    setRequestHeadersOpen,
    setUrl,
    setVariables,
    updateHeader,
    url,
    variables,
  } = useGraphqlClient();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/graphql"
          className="flex-1 font-mono text-sm"
        />
        <Button onClick={handleRun} disabled={loading} className="shrink-0 px-8">
          {loading ? 'Running...' : 'Run Query'}
        </Button>
        <Button variant="outline" onClick={handleIntrospect} disabled={loading} className="shrink-0">
          Introspect
        </Button>
      </div>

      <SharedHeadersEditor
        headers={headers}
        open={requestHeadersOpen}
        onAddHeader={addHeader}
        onRemoveHeader={removeHeader}
        onToggleOpen={() => setRequestHeadersOpen((isOpen) => !isOpen)}
        onUpdateHeader={updateHeader}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Query</p>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={10}
            className="font-mono text-sm"
            placeholder="query { ... }"
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Variables (JSON)</p>
          <Textarea
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            rows={10}
            className="font-mono text-sm"
            placeholder='{ "id": 1 }'
          />
        </div>
      </div>

      {!response && !loading && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">No response yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Enter a GraphQL endpoint and run a query</p>
        </div>
      )}

      {response && (
        <ResponsePanel
          responseHeadersOpen={responseHeadersOpen}
          onToggleResponseHeadersOpen={() => setResponseHeadersOpen((isOpen) => !isOpen)}
          response={response}
        />
      )}
    </div>
  );
}
