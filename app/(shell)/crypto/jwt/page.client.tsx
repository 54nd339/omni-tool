'use client';

import { useState } from 'react';
import { ToolLayout, TwoColumnLayout, ControlPanel, TextAreaInput, Button, CopyButton, Input } from '@/app/components/shared';
import { useAsyncOperation, useClipboard } from '@/app/lib/hooks';
import { decodeJwt, encodeJwt } from '@/app/lib/tools';
import { CRYPTO_DEFAULTS } from '@/app/lib/constants';

export default function JwtPage() {
  const [payload, setPayload] = useState<string>(CRYPTO_DEFAULTS.JWT_PAYLOAD);
  const [secret, setSecret] = useState<string>(CRYPTO_DEFAULTS.JWT_SECRET);
  const [output, setOutput] = useState('');
  const { loading, execute } = useAsyncOperation();
  const clipboard = useClipboard();

  const handleEncode = async () => {
    await execute(async () => {
      const token = await encodeJwt(payload, secret);
      setOutput(token);
      return token;
    });
  };

  const handleDecode = async () => {
    await execute(async () => {
      const decoded = await decodeJwt(output, secret);
      setPayload(JSON.stringify(decoded, null, 2));
      return decoded;
    });
  };

  return (
    <ToolLayout path="/crypto/jwt">
      <TwoColumnLayout
        left={
          <div className="space-y-4">
            <ControlPanel title="Secret Key">
              <Input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter secret key"
              />
            </ControlPanel>

            <ControlPanel title="Payload">
              <TextAreaInput
                label="JSON payload"
                value={payload}
                onChange={setPayload}
                placeholder='{"sub":"123","name":"User"}'
                rows={6}
              />
            </ControlPanel>

            <div className="space-y-2">
              <Button onClick={handleEncode} loading={loading} className="w-full">
                Encode JWT
              </Button>
            </div>
          </div>
        }
        right={
          <div className="space-y-4">
            <ControlPanel title="Token">
              <TextAreaInput label="JWT Token" value={output} onChange={setOutput} rows={8} />
            </ControlPanel>

            <div className="space-y-2">
              <Button onClick={handleDecode} loading={loading} variant="secondary" className="w-full">
                Decode & Verify JWT
              </Button>
              {output && (
                <CopyButton
                  value={output}
                  onCopy={() => clipboard.copy(output)}
                  copied={clipboard.copied}
                  disabled={!output}
                  label="Copy Token"
                />
              )}
            </div>
          </div>
        }
      />
    </ToolLayout>
  );
}
