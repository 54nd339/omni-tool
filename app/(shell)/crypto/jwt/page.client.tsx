'use client';

import React, { useState } from 'react';
import { KeyRound, Copy, Check } from 'lucide-react';
import * as jose from 'jose';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { TwoColumnLayout } from '@/app/components/shared/TwoColumnLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { TextAreaInput } from '@/app/components/shared/TextAreaInput';
import { Button } from '@/app/components/shared/Button';
import { copyToClipboard } from '@/app/lib/utils/text';
import { UI_CONSTANTS } from '@/app/lib/constants';

export default function JwtPage() {
  const [payload, setPayload] = useState('{"sub":"123","name":"OmniTool","iat":1234567890}');
  const [secret, setSecret] = useState('your-secret-key');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEncode = async () => {
    setLoading(true);
    try {
      const payloadObj = JSON.parse(payload);
      const secretKey = new TextEncoder().encode(secret);
      const token = await new jose.SignJWT(payloadObj)
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secretKey);
      setOutput(token);
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = async () => {
    setLoading(true);
    try {
      const secretKey = new TextEncoder().encode(secret);
      const { payload: decoded } = await jose.jwtVerify(output, secretKey);
      setPayload(JSON.stringify(decoded, null, 2));
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), UI_CONSTANTS.ANIMATION.COPY_FEEDBACK_DURATION);
  };

  return (
    <ToolLayout icon={KeyRound} title="JWT Encode/Decode" description="Create and verify JWT tokens with HMAC signature">
      <TwoColumnLayout
        left={
          <div className="space-y-4">
            <ControlPanel title="Secret Key">
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter secret key"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <Button variant="outline" onClick={handleCopy} className="w-full flex items-center justify-center gap-2">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Token
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        }
      />
    </ToolLayout>
  );
}
