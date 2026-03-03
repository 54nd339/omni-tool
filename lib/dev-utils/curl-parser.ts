export interface CurlRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

export function parseCurl(cmd: string): CurlRequest {
  const result: CurlRequest = { method: 'GET', url: '', headers: {}, body: '' };

  const normalized = cmd
    .replace(/\\\n/g, ' ')
    .replace(/\\\r\n/g, ' ')
    .trim();

  const stripped = normalized.replace(/^curl\s+/i, '');

  const tokens: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let escape = false;

  for (const ch of stripped) {
    if (escape) {
      current += ch;
      escape = false;
      continue;
    }
    if (ch === '\\' && !inSingle) {
      escape = true;
      continue;
    }
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if ((ch === ' ' || ch === '\t') && !inSingle && !inDouble) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === '-X' || token === '--request') {
      result.method = (tokens[++i] ?? 'GET').toUpperCase();
      continue;
    }

    if (token === '-H' || token === '--header') {
      const header = tokens[++i] ?? '';
      const colonIdx = header.indexOf(':');
      if (colonIdx > 0) {
        result.headers[header.slice(0, colonIdx).trim()] = header.slice(colonIdx + 1).trim();
      }
      continue;
    }

    if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
      result.body = tokens[++i] ?? '';
      if (result.method === 'GET') result.method = 'POST';
      continue;
    }

    if (token.startsWith('-')) continue;

    if (!result.url) {
      result.url = token;
    }
  }

  return result;
}

export function toCurl(opts: CurlRequest): string {
  const parts = ['curl'];

  if (opts.method !== 'GET') {
    parts.push(`-X ${opts.method}`);
  }

  parts.push(`'${opts.url}'`);

  for (const [key, value] of Object.entries(opts.headers)) {
    if (key.trim()) {
      parts.push(`-H '${key}: ${value}'`);
    }
  }

  if (opts.body.trim()) {
    const escaped = opts.body.replace(/'/g, "'\\''");
    parts.push(`-d '${escaped}'`);
  }

  return parts.join(' \\\n  ');
}
