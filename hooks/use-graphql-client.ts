'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  ensureAtLeastOneHeader,
  EXAMPLE_QUERY,
  executeGraphqlRequest,
  type GqlResponse,
  INTROSPECTION_QUERY,
  makeDefaultHeader,
  makeEmptyHeader,
} from '@/lib/dev-utils/graphql-panel';
import { type HeaderRow } from '@/types/dev-utils';

export function useGraphqlClient() {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState(EXAMPLE_QUERY);
  const [variables, setVariables] = useState('');
  const [headers, setHeaders] = useState<HeaderRow[]>([makeDefaultHeader()]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GqlResponse | null>(null);
  const [responseHeadersOpen, setResponseHeadersOpen] = useState(false);
  const [requestHeadersOpen, setRequestHeadersOpen] = useState(true);

  const updateHeader = useCallback((id: string, field: 'key' | 'value', value: string) => {
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  }, []);

  const addHeader = useCallback(() => {
    setHeaders((prev) => [...prev, makeEmptyHeader()]);
  }, []);

  const removeHeader = useCallback((id: string) => {
    setHeaders((prev) => ensureAtLeastOneHeader(prev.filter((h) => h.id !== id)));
  }, []);

  const sendQuery = useCallback(
    async (gqlQuery: string) => {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        toast.error('Enter a GraphQL endpoint URL');
        return;
      }

      setLoading(true);
      setResponse(null);

      const result = await executeGraphqlRequest({
        endpoint: trimmedUrl,
        headers,
        query: gqlQuery,
        variablesText: variables,
      });

      setResponse(result.response);
      if (result.errorMessage) {
        toast.error(result.errorMessage);
      }
      setLoading(false);
    },
    [headers, url, variables],
  );

  const handleRun = useCallback(() => sendQuery(query), [query, sendQuery]);

  const handleIntrospect = useCallback(
    () => sendQuery(INTROSPECTION_QUERY),
    [sendQuery],
  );

  return {
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
  };
}