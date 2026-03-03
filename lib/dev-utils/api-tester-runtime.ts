import {
  buildHeaderObject,
  createApiId,
  type HttpMethod,
  parseResponseHeaders,
  type RequestHistoryEntry,
  type ResponseState,
  tryFormatJson,
} from '@/lib/dev-utils/api-tester';
import { type HeaderRow } from '@/types/dev-utils';

export const CORS_ERROR_MESSAGE =
  'CORS error: The server may not allow requests from this origin. Try a different URL or use a CORS proxy for testing.';

export const CORS_ERROR_BODY =
  'CORS policy blocked the request. Many APIs require server-side requests or specific CORS headers. Try:\n• A different API that supports CORS\n• Running the request from your backend\n• Using a CORS proxy for development (e.g. cors-anywhere)';

export function makeEmptyHeaderRow(): HeaderRow {
  return { id: createApiId(), key: '', value: '' };
}

export function mapHeadersToRows(headers: Record<string, string>): HeaderRow[] {
  return Object.entries(headers).map(([key, value]) => ({ id: createApiId(), key, value }));
}

export function ensureAtLeastOneHeader(headers: HeaderRow[]): HeaderRow[] {
  return headers.length > 0 ? headers : [makeEmptyHeaderRow()];
}

function isCorsErrorMessage(message: string): boolean {
  return (
    message.includes('fetch') ||
    message.includes('CORS') ||
    message.includes('NetworkError') ||
    message.includes('Failed to fetch')
  );
}

export async function executeRestRequest(params: {
  body: string;
  hasBody: boolean;
  headers: HeaderRow[];
  method: HttpMethod;
  url: string;
}): Promise<{
  errorMessage?: string;
  historyEntry?: RequestHistoryEntry;
  response: ResponseState;
}> {
  const start = performance.now();

  try {
    const headersObject = buildHeaderObject(params.headers);
    const requestInit: RequestInit = { method: params.method, headers: headersObject };

    if (params.hasBody && params.body.trim()) {
      try {
        JSON.parse(params.body);
        requestInit.body = params.body;
        if (!headersObject['Content-Type']) {
          headersObject['Content-Type'] = 'application/json';
        }
      } catch {
        requestInit.body = params.body;
      }
    }

    const apiResponse = await fetch(params.url, requestInit);
    const responseBody = await apiResponse.text();
    const isJson = apiResponse.headers.get('content-type')?.includes('application/json') ?? false;
    const formattedBody = isJson ? tryFormatJson(responseBody) : responseBody;
    const end = performance.now();

    const response: ResponseState = {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      headers: parseResponseHeaders(apiResponse.headers),
      body: formattedBody,
      timeMs: Math.round(end - start),
      sizeBytes: new TextEncoder().encode(responseBody).length,
      ok: apiResponse.ok,
      isJson,
    };

    return {
      response,
      historyEntry: {
        id: createApiId(),
        method: params.method,
        url: params.url,
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        timeMs: response.timeMs,
        responseBody: formattedBody,
        isJson,
      },
    };
  } catch (requestError) {
    const end = performance.now();
    const message = requestError instanceof Error ? requestError.message : 'Request failed';
    const isCorsError = isCorsErrorMessage(message);

    return {
      errorMessage: isCorsError ? CORS_ERROR_MESSAGE : message,
      response: {
        status: 0,
        statusText: 'Error',
        headers: {},
        body: isCorsError ? CORS_ERROR_BODY : message,
        timeMs: Math.round(end - start),
        sizeBytes: 0,
        ok: false,
        isJson: false,
      },
    };
  }
}
