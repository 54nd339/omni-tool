'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CopyButton } from '@/components/shared/copy-button';
import type { CipherAlgorithm } from '@/types';

const ALGORITHMS: CipherAlgorithm[] = ['AES', 'TripleDES', 'Rabbit', 'RC4'];

type Mode = 'encrypt' | 'decrypt';

function encrypt(
  CryptoJS: typeof import('crypto-js'),
  algo: CipherAlgorithm,
  text: string,
  passphrase: string,
): string {
  switch (algo) {
    case 'AES':
      return CryptoJS.AES.encrypt(text, passphrase).toString();
    case 'TripleDES':
      return CryptoJS.TripleDES.encrypt(text, passphrase).toString();
    case 'Rabbit':
      return CryptoJS.Rabbit.encrypt(text, passphrase).toString();
    case 'RC4':
      return CryptoJS.RC4.encrypt(text, passphrase).toString();
  }
}

function decrypt(
  CryptoJS: typeof import('crypto-js'),
  algo: CipherAlgorithm,
  ciphertext: string,
  passphrase: string,
): string {
  try {
    let bytes: import('crypto-js').lib.WordArray;
    switch (algo) {
      case 'AES':
        bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
        break;
      case 'TripleDES':
        bytes = CryptoJS.TripleDES.decrypt(ciphertext, passphrase);
        break;
      case 'Rabbit':
        bytes = CryptoJS.Rabbit.decrypt(ciphertext, passphrase);
        break;
      case 'RC4':
        bytes = CryptoJS.RC4.decrypt(ciphertext, passphrase);
        break;
    }
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result || '(decryption produced empty output — wrong key?)';
  } catch {
    return '(decryption failed — check ciphertext and key)';
  }
}

export function CipherTool() {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [algorithm, setAlgorithm] = useState<CipherAlgorithm>('AES');
  const [passphrase, setPassphrase] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleProcess = useCallback(async () => {
    if (!input || !passphrase) {
      toast.error('Provide both text and passphrase');
      return;
    }
    const mod = await import('crypto-js');
    const CryptoJS =
      (mod as { default?: typeof import('crypto-js') }).default ?? mod;
    const result =
      mode === 'encrypt'
        ? encrypt(CryptoJS, algorithm, input, passphrase)
        : decrypt(CryptoJS, algorithm, input, passphrase);
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
            onValueChange={(v) => v && setMode(v as Mode)}
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
            onValueChange={(v) => v && setAlgorithm(v as CipherAlgorithm)}
          >
            {ALGORITHMS.map((a) => (
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
          onChange={(e) => setInput(e.target.value)}
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
