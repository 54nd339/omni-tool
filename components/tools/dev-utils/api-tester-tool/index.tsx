'use client';

import { lazy, Suspense } from 'react';
import { WifiOff } from 'lucide-react';

import { ToolSkeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useApiTester } from '@/hooks/use-api-tester';

import { SharedHeadersEditor } from './shared/headers-editor';
import { RequestHistoryPanel } from './request-history-panel';
import { RestRequestEditor } from './rest-request-editor';
import { RestResponsePanel } from './rest-response-panel';
import { RestToolbar } from './rest-toolbar';

const GraphqlPanel = lazy(() =>
  import('./graphql-panel').then((module) => ({ default: module.GraphqlPanel })),
);
const WebSocketPanel = lazy(() =>
  import('./websocket-panel').then((module) => ({ default: module.WebSocketPanel })),
);
const ApiCollectionsPanel = lazy(() =>
  import('./api-collections-panel').then((module) => ({ default: module.ApiCollectionsPanel })),
);

export function ApiTesterTool() {
  const {
    addHeader,
    body,
    collectionsOpen,
    curlImportOpen,
    curlInput,
    handleCopyAs,
    handleImportCurl,
    handleLoadRequest,
    handleSaveRequest,
    handleSend,
    hasBody,
    headers,
    responseHeadersOpen,
    historyOpen,
    isOnline,
    loading,
    method,
    mode,
    removeHeader,
    requestHeadersOpen,
    requestHistory,
    response,
    setBody,
    setCollectionsOpen,
    setCurlImportOpen,
    setCurlInput,
    setResponseHeadersOpen,
    setHistoryOpen,
    setMethod,
    setMode,
    setRequestHeadersOpen,
    setRequestHistory,
    setResponse,
    setUrl,
    updateHeader,
    url,
  } = useApiTester();

  return (
    <div className="space-y-6">
      {!isOnline && (
        <div
          className="flex items-center gap-2 rounded-md bg-amber-500/20 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-200"
          role="alert"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>This tool requires an internet connection</span>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <ToggleGroup type="single" value={mode} onValueChange={(value) => value && setMode(value as typeof mode)}>
          <ToggleGroupItem value="rest">REST</ToggleGroupItem>
          <ToggleGroupItem value="graphql">GraphQL</ToggleGroupItem>
          <ToggleGroupItem value="websocket">WebSocket</ToggleGroupItem>
        </ToggleGroup>

        {mode === 'rest' && (
          <RestToolbar
            historyCount={requestHistory.length}
            onCopyAs={handleCopyAs}
            onToggleCollections={() => setCollectionsOpen((open) => !open)}
            onToggleCurlImport={() => setCurlImportOpen((open) => !open)}
            onToggleHistory={() => setHistoryOpen((open) => !open)}
          />
        )}
      </div>

      {mode === 'graphql' && (
        <Suspense fallback={<ToolSkeleton />}>
          <GraphqlPanel />
        </Suspense>
      )}

      {mode === 'websocket' && (
        <Suspense fallback={<ToolSkeleton />}>
          <WebSocketPanel />
        </Suspense>
      )}

      {mode === 'rest' && (
        <div className="space-y-6">
          <RestRequestEditor
            state={{
              body,
              curlImportOpen,
              curlInput,
              hasBody,
              isOnline,
              loading,
              method,
              url,
            }}
            actions={{
              onBodyChange: setBody,
              onCancelCurlImport: () => {
                setCurlImportOpen(false);
                setCurlInput('');
              },
              onCurlInputChange: setCurlInput,
              onImportCurl: handleImportCurl,
              onMethodChange: setMethod,
              onSend: handleSend,
              onUrlChange: setUrl,
            }}
          />

          {collectionsOpen && (
            <Suspense fallback={<div className="h-20 animate-pulse rounded-md bg-muted" />}>
              <ApiCollectionsPanel onSaveRequest={handleSaveRequest} onLoadRequest={handleLoadRequest} />
            </Suspense>
          )}

          {historyOpen && (
            <RequestHistoryPanel
              requestHistory={requestHistory}
              onClearHistory={() => setRequestHistory([])}
              onSelectHistory={(historyResponse) => {
                setResponse(historyResponse);
                setHistoryOpen(false);
              }}
            />
          )}

          <SharedHeadersEditor
            headers={headers}
            open={requestHeadersOpen}
            onToggleOpen={() => setRequestHeadersOpen((open) => !open)}
            onAddHeader={addHeader}
            onRemoveHeader={removeHeader}
            onUpdateHeader={updateHeader}
          />

          <div className="space-y-6 lg:sticky lg:top-6">
            <RestResponsePanel
              loading={loading}
              response={response}
              responseHeadersOpen={responseHeadersOpen}
              onToggleResponseHeaders={() => setResponseHeadersOpen((open) => !open)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
