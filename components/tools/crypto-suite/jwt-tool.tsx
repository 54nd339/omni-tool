'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CopyButton } from '@/components/shared/copy-button';
import { SendToButton } from '@/components/shared/send-to-button';
import { useToolParams } from '@/hooks';

type Mode = 'decode' | 'encode';

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  valid: boolean | null;
}

async function decodeJwt(token: string): Promise<DecodedJwt | null> {
  try {
    const jose = await import('jose');
    const header = jose.decodeProtectedHeader(token);
    const payload = jose.decodeJwt(token);
    return { header, payload, valid: null };
  } catch {
    return null;
  }
}

function formatTimestamp(epoch: unknown): string | null {
  if (typeof epoch !== 'number') return null;
  try {
    return new Date(epoch * 1000).toLocaleString();
  } catch {
    return null;
  }
}

export function JwtTool() {
  const [params] = useToolParams({ paste: '' });
  const [mode, setMode] = useState<Mode>('decode');
  const [token, setToken] = useState(params.paste || '');
  const [secret, setSecret] = useState('');
  const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe"\n}');
  const [result, setResult] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);

  const handleDecode = useCallback(async () => {
    if (!token.trim()) return;
    const d = await decodeJwt(token.trim());
    if (d) {
      setDecoded(d);
      setResult(JSON.stringify({ header: d.header, payload: d.payload }, null, 2));
    } else {
      setDecoded(null);
      setResult('Invalid JWT');
    }
  }, [token]);

  const handleVerify = useCallback(async () => {
    if (!token.trim() || !secret) {
      toast.error('Provide both token and secret');
      return;
    }
    try {
      const jose = await import('jose');
      const key = new TextEncoder().encode(secret);
      await jose.jwtVerify(token.trim(), key);
      toast.success('Signature valid');
      setDecoded((prev) => (prev ? { ...prev, valid: true } : prev));
    } catch {
      toast.error('Signature invalid');
      setDecoded((prev) => (prev ? { ...prev, valid: false } : prev));
    }
  }, [token, secret]);

  const handleEncode = useCallback(async () => {
    if (!secret) {
      toast.error('Provide a secret key');
      return;
    }
    try {
      const jose = await import('jose');
      const payloadObj = JSON.parse(payload);
      const key = new TextEncoder().encode(secret);
      const jwt = await new jose.SignJWT(payloadObj)
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt()
        .sign(key);
      setResult(jwt);
    } catch {
      toast.error('Invalid JSON payload');
    }
  }, [payload, secret]);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => {
            if (!v) return;
            setMode(v as Mode);
            setResult('');
            setDecoded(null);
          }}
        >
          <ToggleGroupItem value="decode">Decode / Verify</ToggleGroupItem>
          <ToggleGroupItem value="encode">Encode</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Secret (HS256)
        </p>
        <Input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Used for signing / verification"
        />
      </div>

      {mode === 'decode' && (
        <>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              JWT Token
            </p>
            <Textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={4}
              placeholder="Paste a JWT token..."
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleDecode}>Decode</Button>
            <Button variant="outline" onClick={handleVerify}>
              Verify signature
            </Button>
          </div>

          {decoded && (
            <div className="space-y-2">
              {decoded.valid === true && (
                <p className="text-xs font-medium text-green-600">
                  Signature valid
                </p>
              )}
              {decoded.valid === false && (
                <p className="text-xs font-medium text-red-500">
                  Signature invalid
                </p>
              )}
              {(() => {
                const iat = formatTimestamp(decoded.payload.iat);
                const exp = formatTimestamp(decoded.payload.exp);
                const nbf = formatTimestamp(decoded.payload.nbf);
                if (!iat && !exp && !nbf) return null;
                const isExpired = typeof decoded.payload.exp === 'number' && decoded.payload.exp * 1000 < Date.now();
                return (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {iat && <span>Issued: {iat}</span>}
                    {nbf && <span>Not before: {nbf}</span>}
                    {exp && (
                      <span className={isExpired ? 'text-red-500' : ''}>
                        Expires: {exp}{isExpired ? ' (expired)' : ''}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      {mode === 'encode' && (
        <>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Payload (JSON)
            </p>
            <Textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={6}
              className="font-mono text-sm"
              autoFocus
            />
          </div>
          <Button onClick={handleEncode}>Sign &amp; Encode</Button>
        </>
      )}

      {result && (
        <div className="relative">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {mode === 'decode' ? 'Decoded' : 'Signed JWT'}
          </p>
          <div className="flex items-start gap-2 rounded-md border border-border p-3">
            <code className="min-w-0 flex-1 break-all whitespace-pre-wrap font-mono text-sm">
              {result}
            </code>
            <SendToButton value={result} outputType={mode === 'decode' ? 'json' : 'text'} />
            <CopyButton value={result} />
          </div>
        </div>
      )}
    </div>
  );
}
