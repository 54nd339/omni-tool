import { createId } from '@/lib/utils';
import { type HeaderRow } from '@/types/dev-utils';

export interface GqlResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timeMs: number;
  ok: boolean;
}

export interface GraphqlRequestResult {
  errorMessage?: string;
  response: GqlResponse;
}

export const EXAMPLE_QUERY = `query {
  users {
    id
    name
    email
  }
}`;

export const INTROSPECTION_QUERY = `query IntrospectionQuery {
  __schema {
    types {
      name
      kind
      description
      fields {
        name
        type { name kind }
      }
    }
  }
}`;

export function generateId(): string {
  return createId();
}

export function makeDefaultHeader(): HeaderRow {
  return { id: generateId(), key: 'Content-Type', value: 'application/json' };
}

export function makeEmptyHeader(): HeaderRow {
  return { id: generateId(), key: '', value: '' };
}

export function ensureAtLeastOneHeader(headers: HeaderRow[]): HeaderRow[] {
  return headers.length > 0 ? headers : [makeEmptyHeader()];
}

export function buildHeadersObject(headers: HeaderRow[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const header of headers) {
    const key = header.key.trim();
    if (key) {
      result[key] = header.value.trim();
    }
  }

  return result;
}

export function parseVariablesJson(value: string): {
  errorMessage: string | null;
  variables?: Record<string, unknown>;
} {
  if (!value.trim()) {
    return { errorMessage: null };
  }

  try {
    return {
      errorMessage: null,
      variables: JSON.parse(value) as Record<string, unknown>,
    };
  } catch {
    return { errorMessage: 'Variables must be valid JSON' };
  }
}

function formatResponseBody(rawText: string): string {
  try {
    return JSON.stringify(JSON.parse(rawText), null, 2);
  } catch {
    return rawText;
  }
}

function collectResponseHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export async function executeGraphqlRequest(params: {
  endpoint: string;
  headers: HeaderRow[];
  query: string;
  variablesText: string;
}): Promise<GraphqlRequestResult> {
  const parsedVariables = parseVariablesJson(params.variablesText);
  if (parsedVariables.errorMessage) {
    return {
      errorMessage: parsedVariables.errorMessage,
      response: {
        status: 0,
        statusText: 'Error',
        headers: {},
        body: parsedVariables.errorMessage,
        timeMs: 0,
        ok: false,
      },
    };
  }

  const start = performance.now();

  try {
    const response = await fetch(params.endpoint, {
      method: 'POST',
      headers: buildHeadersObject(params.headers),
      body: JSON.stringify({
        query: params.query,
        ...(parsedVariables.variables ? { variables: parsedVariables.variables } : {}),
      }),
    });

    const end = performance.now();
    const text = await response.text();

    return {
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: collectResponseHeaders(response.headers),
        body: formatResponseBody(text),
        timeMs: Math.round(end - start),
        ok: response.ok,
      },
    };
  } catch (error) {
    const end = performance.now();
    const message = error instanceof Error ? error.message : 'Request failed';

    return {
      errorMessage: message,
      response: {
        status: 0,
        statusText: 'Error',
        headers: {},
        body: message,
        timeMs: Math.round(end - start),
        ok: false,
      },
    };
  }
}
