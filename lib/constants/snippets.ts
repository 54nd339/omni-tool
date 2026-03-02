export interface ToolSnippet {
  id: string;
  toolId: string;
  name: string;
  params: Record<string, string>;
  builtIn?: boolean;
}

export const BUILT_IN_SNIPPETS: ToolSnippet[] = [
  // Code Formatter
  {
    id: 'snippet-formatter-html',
    toolId: 'code-formatter',
    name: 'Sample HTML',
    params: { paste: '<div class="container"><h1>Hello</h1><p>World</p></div>', lang: 'html' },
    builtIn: true,
  },
  {
    id: 'snippet-formatter-json',
    toolId: 'code-formatter',
    name: 'Sample JSON',
    params: { paste: '{"name":"test","version":"1.0","dependencies":{"react":"^19.0.0"}}', lang: 'json' },
    builtIn: true,
  },
  // API Tester
  {
    id: 'snippet-api-jsonplaceholder',
    toolId: 'api-tester',
    name: 'JSONPlaceholder GET',
    params: { url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
    builtIn: true,
  },
  {
    id: 'snippet-api-httpbin-post',
    toolId: 'api-tester',
    name: 'httpbin POST',
    params: { url: 'https://httpbin.org/post', method: 'POST', body: '{"hello":"world"}' },
    builtIn: true,
  },
  // Cron Builder
  {
    id: 'snippet-cron-every5min',
    toolId: 'cron-builder',
    name: 'Every 5 Minutes',
    params: { expression: '*/5 * * * *' },
    builtIn: true,
  },
  {
    id: 'snippet-cron-weekday9am',
    toolId: 'cron-builder',
    name: 'Weekdays at 9 AM',
    params: { expression: '0 9 * * 1-5' },
    builtIn: true,
  },
];
