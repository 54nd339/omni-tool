'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CopyButton } from '@/components/shared/copy-button';
import { SendToButton } from '@/components/shared/send-to-button';
import type { HashAlgorithm } from '@/types';

const ALGORITHMS: { id: HashAlgorithm; label: string; needsKey: boolean }[] = [
  { id: 'MD5', label: 'MD5', needsKey: false },
  { id: 'SHA1', label: 'SHA-1', needsKey: false },
  { id: 'SHA256', label: 'SHA-256', needsKey: false },
  { id: 'SHA384', label: 'SHA-384', needsKey: false },
  { id: 'SHA512', label: 'SHA-512', needsKey: false },
  { id: 'HMAC-SHA256', label: 'HMAC-SHA256', needsKey: true },
];

const WEB_CRYPTO_ALGOS: Record<string, string> = {
  SHA1: 'SHA-1',
  SHA256: 'SHA-256',
  SHA384: 'SHA-384',
  SHA512: 'SHA-512',
};

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Minimal MD5 — no external dependency needed
function md5(input: string): string {
  const enc = new TextEncoder();
  const d = enc.encode(input);
  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476;
  const K = new Uint32Array(64);
  const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  for (let i = 0; i < 64; i++) K[i] = Math.floor(2 ** 32 * Math.abs(Math.sin(i + 1))) >>> 0;
  const bitLen = d.length * 8;
  const padLen = ((56 - (d.length + 1) % 64) + 64) % 64;
  const msg = new Uint8Array(d.length + 1 + padLen + 8);
  msg.set(d); msg[d.length] = 0x80;
  const view = new DataView(msg.buffer);
  view.setUint32(msg.length - 8, bitLen >>> 0, true);
  view.setUint32(msg.length - 4, Math.floor(bitLen / 2 ** 32) >>> 0, true);
  for (let off = 0; off < msg.length; off += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) M[j] = view.getUint32(off + j * 4, true);
    let a = h0, b = h1, c = h2, dd = h3;
    for (let i = 0; i < 64; i++) {
      let f: number, g: number;
      if (i < 16) { f = (b & c) | (~b & dd); g = i; }
      else if (i < 32) { f = (dd & b) | (~dd & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ dd; g = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~dd); g = (7 * i) % 16; }
      const tmp = dd; dd = c; c = b;
      const rot = (a + f + K[i] + M[g]) >>> 0;
      b = (b + ((rot << S[i]) | (rot >>> (32 - S[i])))) >>> 0;
      a = tmp;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + dd) >>> 0;
  }
  const result = new DataView(new ArrayBuffer(16));
  result.setUint32(0, h0, true); result.setUint32(4, h1, true);
  result.setUint32(8, h2, true); result.setUint32(12, h3, true);
  return bufToHex(result.buffer);
}

async function computeHash(
  algo: HashAlgorithm,
  input: string,
  key: string,
): Promise<string> {
  const encoder = new TextEncoder();
  if (algo === 'MD5') return md5(input);
  if (algo === 'HMAC-SHA256') {
    const cryptoKey = await crypto.subtle.importKey(
      'raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    return bufToHex(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(input)));
  }
  const webAlgo = WEB_CRYPTO_ALGOS[algo];
  if (webAlgo) return bufToHex(await crypto.subtle.digest(webAlgo, encoder.encode(input)));
  return '';
}

export function HashGeneratorTool() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA256');
  const [key, setKey] = useState('');
  const [hash, setHash] = useState('');

  const needsKey = ALGORITHMS.find((a) => a.id === algorithm)?.needsKey ?? false;

  useEffect(() => {
    if (!input) {
      setHash('');
      return;
    }
    let cancelled = false;
    computeHash(algorithm, input, key).then((result) => {
      if (!cancelled) setHash(result);
    });
    return () => {
      cancelled = true;
    };
  }, [input, algorithm, key]);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Algorithm
        </p>
        <ToggleGroup
          type="single"
          value={algorithm}
          onValueChange={(v) => v && setAlgorithm(v as HashAlgorithm)}
        >
          {ALGORITHMS.map((a) => (
            <ToggleGroupItem key={a.id} value={a.id}>
              {a.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {needsKey && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Secret key
          </p>
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter secret key"
          />
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Input
        </p>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text to hash..."
          rows={6}
          autoFocus
        />
      </div>

      {hash && (
        <div className="relative">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {algorithm} Hash
          </p>
          <div className="flex items-start gap-2 rounded-md border border-border p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-sm">
              {hash}
            </code>
            <SendToButton value={hash} outputType="hash" />
            <CopyButton value={hash} />
          </div>
        </div>
      )}
    </div>
  );
}
