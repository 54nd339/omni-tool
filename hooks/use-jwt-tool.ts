'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { useToolParams } from '@/hooks/use-tool-params';
import {
  type DecodedJwt,
  decodeJwt,
  encodeJwt,
  verifyJwt,
} from '@/lib/crypto/jwt';

export type JwtToolMode = 'decode' | 'encode';

const PARAM_DEFAULTS = { paste: '' };
const DEFAULT_PAYLOAD = '{\n  "sub": "1234567890",\n  "name": "John Doe"\n}';

export function useJwtTool() {
  const [params] = useToolParams(PARAM_DEFAULTS);
  const [mode, setMode] = useState<JwtToolMode>('decode');
  const [token, setToken] = useState(params.paste || '');
  const [secret, setSecret] = useState('');
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [result, setResult] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);

  const handleModeChange = useCallback((nextMode: JwtToolMode) => {
    setMode(nextMode);
    setResult('');
    setDecoded(null);
  }, []);

  const handleDecode = useCallback(async () => {
    if (!token.trim()) return;
    const nextDecoded = await decodeJwt(token.trim());
    if (nextDecoded) {
      setDecoded(nextDecoded);
      setResult(JSON.stringify({
        header: nextDecoded.header,
        payload: nextDecoded.payload,
      }, null, 2));
      return;
    }

    setDecoded(null);
    setResult('Invalid JWT');
  }, [token]);

  const handleVerify = useCallback(async () => {
    if (!token.trim() || !secret) {
      toast.error('Provide both token and secret');
      return;
    }
    const isValid = await verifyJwt(token.trim(), secret);
    if (isValid) {
      toast.success('Signature valid');
      setDecoded((previous) => (previous ? { ...previous, valid: true } : previous));
      return;
    }

    toast.error('Signature invalid');
    setDecoded((previous) => (previous ? { ...previous, valid: false } : previous));
  }, [secret, token]);

  const handleEncode = useCallback(async () => {
    if (!secret) {
      toast.error('Provide a secret key');
      return;
    }

    try {
      const payloadObject = JSON.parse(payload);
      const jwt = await encodeJwt(payloadObject, secret);
      setResult(jwt);
    } catch {
      toast.error('Invalid JSON payload');
    }
  }, [payload, secret]);

  return {
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
  };
}
