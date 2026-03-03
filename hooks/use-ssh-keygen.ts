'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { useToolParams } from '@/hooks/use-tool-params';
import { generateSshKeyPair, type SshAlgorithm } from '@/lib/crypto/ssh-keygen';
import { downloadBlob } from '@/lib/utils';

const PARAM_DEFAULTS = {
  algorithm: 'ed25519',
  comment: 'user@omnitool',
};

export function useSshKeygen() {
  const [params, setParams] = useToolParams(PARAM_DEFAULTS);
  const algorithm: SshAlgorithm =
    params.algorithm === 'rsa-2048' || params.algorithm === 'rsa-4096'
      ? params.algorithm
      : 'ed25519';
  const comment = params.comment || 'user@omnitool';

  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const generated = await generateSshKeyPair(algorithm, comment);
      setPublicKey(generated.publicKey);
      setPrivateKey(generated.privateKey);
      toast.success('Key pair generated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Key generation failed');
    } finally {
      setGenerating(false);
    }
  }, [algorithm, comment]);

  const handleDownload = useCallback((content: string, fileName: string) => {
    downloadBlob(new Blob([content], { type: 'text/plain' }), fileName);
  }, []);

  return {
    algorithm,
    comment,
    generating,
    handleDownload,
    handleGenerate,
    privateKey,
    publicKey,
    setParams,
  };
}
