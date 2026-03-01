import { type CurlRequest, toCurl } from './curl-parser';

function headerEntries(headers: Record<string, string>): [string, string][] {
  return Object.entries(headers).filter(([k]) => k.trim());
}

export function toFetch(req: CurlRequest): string {
  const headers = headerEntries(req.headers);
  const hasHeaders = headers.length > 0;
  const hasBody = req.body.trim() !== '';

  const lines: string[] = [`fetch('${req.url}', {`];
  lines.push(`  method: '${req.method}',`);

  if (hasHeaders) {
    lines.push('  headers: {');
    for (const [k, v] of headers) {
      lines.push(`    '${k}': '${v}',`);
    }
    lines.push('  },');
  }

  if (hasBody) {
    try {
      JSON.parse(req.body);
      lines.push(`  body: JSON.stringify(${req.body}),`);
    } catch {
      lines.push(`  body: '${req.body.replace(/'/g, "\\'")}',`);
    }
  }

  lines.push('})');
  lines.push('  .then(res => res.json())');
  lines.push('  .then(data => console.log(data))');
  lines.push('  .catch(err => console.error(err));');

  return lines.join('\n');
}

export function toAxios(req: CurlRequest): string {
  const headers = headerEntries(req.headers);
  const hasHeaders = headers.length > 0;
  const hasBody = req.body.trim() !== '';

  const lines: string[] = [`axios({`];
  lines.push(`  method: '${req.method.toLowerCase()}',`);
  lines.push(`  url: '${req.url}',`);

  if (hasHeaders) {
    lines.push('  headers: {');
    for (const [k, v] of headers) {
      lines.push(`    '${k}': '${v}',`);
    }
    lines.push('  },');
  }

  if (hasBody) {
    try {
      JSON.parse(req.body);
      lines.push(`  data: ${req.body},`);
    } catch {
      lines.push(`  data: '${req.body.replace(/'/g, "\\'")}',`);
    }
  }

  lines.push('})');
  lines.push('  .then(res => console.log(res.data))');
  lines.push('  .catch(err => console.error(err));');

  return lines.join('\n');
}

export function toPythonRequests(req: CurlRequest): string {
  const headers = headerEntries(req.headers);
  const hasBody = req.body.trim() !== '';
  const method = req.method.toLowerCase();

  const lines: string[] = ['import requests', ''];
  lines.push(`url = '${req.url}'`);

  if (headers.length > 0) {
    lines.push('headers = {');
    for (const [k, v] of headers) {
      lines.push(`    '${k}': '${v}',`);
    }
    lines.push('}');
  }

  const args: string[] = ['url'];
  if (headers.length > 0) args.push('headers=headers');

  if (hasBody) {
    let isJson = false;
    try {
      JSON.parse(req.body);
      isJson = true;
    } catch { /* not json */ }

    if (isJson) {
      lines.push(`payload = ${req.body}`);
      args.push('json=payload');
    } else {
      lines.push(`data = '${req.body.replace(/'/g, "\\'")}'`);
      args.push('data=data');
    }
  }

  lines.push('');
  lines.push(`response = requests.${method}(${args.join(', ')})`);
  lines.push('print(response.status_code)');
  lines.push('print(response.json())');

  return lines.join('\n');
}

export function toGoHttp(req: CurlRequest): string {
  const headers = headerEntries(req.headers);
  const hasBody = req.body.trim() !== '';

  const lines: string[] = [
    'package main',
    '',
    'import (',
    '\t"fmt"',
    '\t"io"',
    '\t"net/http"',
  ];

  if (hasBody) {
    lines.push('\t"strings"');
  }

  lines.push(')', '');
  lines.push('func main() {');

  if (hasBody) {
    lines.push(`\tbody := strings.NewReader(\`${req.body}\`)`);
    lines.push(`\treq, err := http.NewRequest("${req.method}", "${req.url}", body)`);
  } else {
    lines.push(`\treq, err := http.NewRequest("${req.method}", "${req.url}", nil)`);
  }

  lines.push('\tif err != nil {');
  lines.push('\t\tpanic(err)');
  lines.push('\t}');

  for (const [k, v] of headers) {
    lines.push(`\treq.Header.Set("${k}", "${v}")`);
  }

  lines.push('');
  lines.push('\tresp, err := http.DefaultClient.Do(req)');
  lines.push('\tif err != nil {');
  lines.push('\t\tpanic(err)');
  lines.push('\t}');
  lines.push('\tdefer resp.Body.Close()');
  lines.push('');
  lines.push('\tdata, _ := io.ReadAll(resp.Body)');
  lines.push('\tfmt.Println(string(data))');
  lines.push('}');

  return lines.join('\n');
}

export function toPhpCurl(req: CurlRequest): string {
  const headers = headerEntries(req.headers);
  const hasBody = req.body.trim() !== '';

  const lines: string[] = ['<?php', ''];
  lines.push('$ch = curl_init();');
  lines.push('');
  lines.push(`curl_setopt($ch, CURLOPT_URL, '${req.url}');`);
  lines.push('curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);');

  if (req.method !== 'GET') {
    lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${req.method}');`);
  }

  if (headers.length > 0) {
    lines.push('curl_setopt($ch, CURLOPT_HTTPHEADER, [');
    for (const [k, v] of headers) {
      lines.push(`    '${k}: ${v}',`);
    }
    lines.push(']);');
  }

  if (hasBody) {
    lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, '${req.body.replace(/'/g, "\\'")}');`);
  }

  lines.push('');
  lines.push('$response = curl_exec($ch);');
  lines.push('$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);');
  lines.push('curl_close($ch);');
  lines.push('');
  lines.push('echo $httpCode . "\\n";');
  lines.push('echo $response;');

  return lines.join('\n');
}

export type CodeTarget = 'curl' | 'fetch' | 'axios' | 'python' | 'go' | 'php';

export const CODE_TARGETS: { id: CodeTarget; label: string }[] = [
  { id: 'curl', label: 'cURL' },
  { id: 'fetch', label: 'JS fetch' },
  { id: 'axios', label: 'JS axios' },
  { id: 'python', label: 'Python requests' },
  { id: 'go', label: 'Go net/http' },
  { id: 'php', label: 'PHP cURL' },
];

export function generateCode(target: CodeTarget, req: CurlRequest): string {
  switch (target) {
    case 'curl':
      return toCurl(req);
    case 'fetch':
      return toFetch(req);
    case 'axios':
      return toAxios(req);
    case 'python':
      return toPythonRequests(req);
    case 'go':
      return toGoHttp(req);
    case 'php':
      return toPhpCurl(req);
  }
}
