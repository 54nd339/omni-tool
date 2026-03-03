'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToolParams } from '@/hooks/use-tool-params';
import { CIPHER_ALGORITHMS } from '@/lib/constants/crypto';
import { processCipher } from '@/lib/crypto/cipher';
import type { CipherAlgorithm } from '@/types/common';

type Mode = 'encrypt' | 'decrypt';
const PARAM_DEFAULTS = {
  mode: 'encrypt',
  algorithm: 'AES',
  input: '',
};

export function CipherTool() {
  const [params, setParams] = useToolParams(PARAM_DEFAULTS);
  const [passphrase, setPassphrase] = useState('');
  const [output, setOutput] = useState('');

  const mode: Mode = params.mode === 'decrypt' ? 'decrypt' : 'encrypt';
  const algorithm: CipherAlgorithm = CIPHER_ALGORITHMS.includes(params.algorithm as CipherAlgorithm)
    ? (params.algorithm as CipherAlgorithm)
    : 'AES';
  const input = params.input;

  const handleProcess = useCallback(async () => {
    if (!input || !passphrase) {
      toast.error('Provide both text and passphrase');
      return;
    }
    const result = await processCipher(mode, algorithm, input, passphrase);
    setOutput(result);
  }, [mode, algorithm, input, passphrase]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => v && setParams({ mode: v as Mode })}
          >
            <ToggleGroupItem value="encrypt">Encrypt</ToggleGroupItem>
            <ToggleGroupItem value="decrypt">Decrypt</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Algorithm
          </p>
          <ToggleGroup
            type="single"
            value={algorithm}
            onValueChange={(v) => v && setParams({ algorithm: v as CipherAlgorithm })}
          >
            {CIPHER_ALGORITHMS.map((a) => (
              <ToggleGroupItem key={a} value={a}>
                {a}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Passphrase
        </p>
        <Input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="Enter passphrase"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {mode === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
        </p>
        <Textarea
          value={input}
          onChange={(e) => setParams({ input: e.target.value })}
          rows={5}
          placeholder={
            mode === 'encrypt'
              ? 'Enter text to encrypt...'
              : 'Paste ciphertext to decrypt...'
          }
          autoFocus
        />
      </div>

      <Button onClick={handleProcess}>
        {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
      </Button>

      {output && (
        <div className="relative">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {mode === 'encrypt' ? 'Ciphertext' : 'Plaintext'}
          </p>
          <div className="flex items-start gap-2 rounded-md border border-border p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-sm">
              {output}
            </code>
            <CopyButton value={output} />
          </div>
        </div>
      )}
    </div>
  );
}
