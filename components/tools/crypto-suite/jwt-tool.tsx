'use client';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { SendToButton } from '@/components/shared/tool-actions/send-to-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { type JwtToolMode,useJwtTool } from '@/hooks/use-jwt-tool';
import {
  formatTimestamp,
} from '@/lib/crypto/jwt';

export function JwtTool() {
  const {
    decoded,
    handleDecode,
    handleEncode,
    handleModeChange,
    handleVerify,
    mode,
    payload,
    result,
    secret,
    setPayload,
    setSecret,
    setToken,
    token,
  } = useJwtTool();

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => {
            if (!v) return;
            handleModeChange(v as JwtToolMode);
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
                return (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {iat && <span>Issued: {iat}</span>}
                    {nbf && <span>Not before: {nbf}</span>}
                    {exp && <span>Expires: {exp}</span>}
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
