'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CopyButton } from '@/components/shared/copy-button';

type Algorithm = 'ed25519' | 'rsa-2048' | 'rsa-4096';

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function encodeOpenSSHPublicKey(algorithm: Algorithm, publicKeyDer: ArrayBuffer): string {
  const encoder = new TextEncoder();
  const pubBytes = new Uint8Array(publicKeyDer);

  if (algorithm === 'ed25519') {
    const rawKey = pubBytes.slice(-32);
    const keyType = encoder.encode('ssh-ed25519');
    const buf = new Uint8Array(4 + keyType.length + 4 + rawKey.length);
    const view = new DataView(buf.buffer);
    let offset = 0;
    view.setUint32(offset, keyType.length);
    offset += 4;
    buf.set(keyType, offset);
    offset += keyType.length;
    view.setUint32(offset, rawKey.length);
    offset += 4;
    buf.set(rawKey, offset);
    return `ssh-ed25519 ${arrayBufferToBase64(buf.buffer)}`;
  }

  const keyType = encoder.encode('ssh-rsa');
  const spki = pubBytes;

  // Parse RSA SPKI to get modulus and exponent
  // SPKI wraps the RSA public key: SEQUENCE { algorithm, BIT STRING { SEQUENCE { modulus, exponent } } }
  const { n, e } = parseRsaSpki(spki);

  const parts: Uint8Array[] = [];
  parts.push(encodeSSHString(keyType));
  parts.push(encodeSSHMpint(e));
  parts.push(encodeSSHMpint(n));

  const totalLen = parts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(totalLen);
  let off = 0;
  for (const p of parts) { result.set(p, off); off += p.length; }
  return `ssh-rsa ${arrayBufferToBase64(result.buffer)}`;
}

function parseRsaSpki(der: Uint8Array): { n: Uint8Array; e: Uint8Array } {
  let pos = 0;
  function readTag() { return der[pos++]; }
  function readLength(): number {
    let len = der[pos++];
    if (len & 0x80) {
      const numBytes = len & 0x7f;
      len = 0;
      for (let i = 0; i < numBytes; i++) len = (len << 8) | der[pos++];
    }
    return len;
  }
  function readSequence() { readTag(); readLength(); }
  function readBytes(): Uint8Array {
    readTag();
    const len = readLength();
    const data = der.slice(pos, pos + len);
    pos += len;
    return data;
  }

  // Outer SEQUENCE
  readSequence();
  // AlgorithmIdentifier SEQUENCE
  const algStart = pos;
  readTag();
  const algLen = readLength();
  pos = algStart + 2 + (der[algStart + 1] & 0x80 ? (der[algStart + 1] & 0x7f) + 1 : 1) - 1;
  pos = algStart;
  readSequence();
  // Skip OID and optional NULL
  readBytes(); // OID
  if (pos < der.length && der[pos] === 0x05) { readTag(); readLength(); } // NULL

  // BIT STRING
  readTag();
  const bsLen = readLength();
  pos++; // skip unused bits byte

  // Inner SEQUENCE { INTEGER modulus, INTEGER exponent }
  readSequence();
  const n = readBytes(); // modulus
  const e = readBytes(); // exponent
  return {
    n: n[0] === 0 ? n.slice(1) : n,
    e: e[0] === 0 ? e.slice(1) : e,
  };
}

function encodeSSHString(data: Uint8Array): Uint8Array {
  const buf = new Uint8Array(4 + data.length);
  new DataView(buf.buffer).setUint32(0, data.length);
  buf.set(data, 4);
  return buf;
}

function encodeSSHMpint(data: Uint8Array): Uint8Array {
  const needsPad = data[0] & 0x80;
  const len = data.length + (needsPad ? 1 : 0);
  const buf = new Uint8Array(4 + len);
  new DataView(buf.buffer).setUint32(0, len);
  buf.set(data, needsPad ? 5 : 4);
  return buf;
}

function wrapPem(label: string, der: ArrayBuffer): string {
  const b64 = arrayBufferToBase64(der);
  const lines = b64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

export function SshKeygenTool() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('ed25519');
  const [comment, setComment] = useState('user@omnitool');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      if (algorithm === 'ed25519') {
        const keyPair = await crypto.subtle.generateKey('Ed25519', true, ['sign', 'verify']);
        const pubDer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
        const privDer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
        const pubLine = encodeOpenSSHPublicKey('ed25519', pubDer);
        setPublicKey(`${pubLine} ${comment}`);
        setPrivateKey(wrapPem('PRIVATE KEY', privDer));
      } else {
        const bits = algorithm === 'rsa-2048' ? 2048 : 4096;
        const keyPair = await crypto.subtle.generateKey(
          { name: 'RSASSA-PKCS1-v1_5', modulusLength: bits, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
          true,
          ['sign', 'verify'],
        );
        const pubDer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
        const privDer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
        const pubLine = encodeOpenSSHPublicKey(algorithm, pubDer);
        setPublicKey(`${pubLine} ${comment}`);
        setPrivateKey(wrapPem('PRIVATE KEY', privDer));
      }
      toast.success('Key pair generated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Key generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Algorithm</p>
          <ToggleGroup type="single" value={algorithm} onValueChange={(v) => v && setAlgorithm(v as Algorithm)}>
            <ToggleGroupItem value="ed25519">Ed25519</ToggleGroupItem>
            <ToggleGroupItem value="rsa-2048">RSA 2048</ToggleGroupItem>
            <ToggleGroupItem value="rsa-4096">RSA 4096</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Comment</p>
          <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="user@hostname" />
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : 'Generate Key Pair'}
        </Button>
      </div>

      {publicKey && (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Public Key (.pub)</p>
              <div className="flex gap-2">
                <CopyButton value={publicKey} size="sm" />
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleDownload(publicKey, 'id_' + algorithm.replace('-', '') + '.pub')}>
                  Download
                </Button>
              </div>
            </div>
            <Textarea value={publicKey} readOnly rows={3} className="font-mono text-xs resize-none bg-muted/50 break-all" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Private Key</p>
              <div className="flex gap-2">
                <CopyButton value={privateKey} size="sm" />
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleDownload(privateKey, 'id_' + algorithm.replace('-', ''))}>
                  Download
                </Button>
              </div>
            </div>
            <Textarea value={privateKey} readOnly rows={10} className="font-mono text-xs resize-none bg-muted/50" />
          </div>
        </div>
      )}
    </div>
  );
}
