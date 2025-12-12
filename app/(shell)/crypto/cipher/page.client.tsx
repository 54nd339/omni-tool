'use client';

import { useState } from 'react';
import { ToolLayout, TwoColumnLayout, ControlPanel, TextAreaInput, Button, CopyButton, Select, Input } from '@/app/components/shared';
import { UI_CONSTANTS, CIPHER_MODES, CRYPTO_DEFAULTS } from '@/app/lib/constants';
import { useAsyncOperation, useClipboard } from '@/app/lib/hooks';
import { encodeCipher, decodeCipher } from '@/app/lib/utils';
import { CipherMode } from '@/app/lib/types';

export default function CipherPage() {
  const [input, setInput] = useState('');
  const [secret, setSecret] = useState<string>(UI_CONSTANTS.CRYPTO.DEFAULT_SECRET);
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<CipherMode>(CRYPTO_DEFAULTS.CIPHER_MODE);
  const { loading, execute } = useAsyncOperation();
  const clipboard = useClipboard();

  const handleEncode = () => {
    if (!input) return;
    execute(async () => {
      const result = encodeCipher(mode, secret, input);
      setOutput(result);
      return result;
    });
  };

  const handleDecode = () => {
    if (!input) return;
    execute(async () => {
      const result = decodeCipher(mode, secret, input);
      setOutput(result);
      return result;
    });
  };

  return (
    <ToolLayout path="/crypto/cipher">
      <TwoColumnLayout
        left={
          <div className="space-y-4">
            <ControlPanel title="Input">
              <TextAreaInput
                label="Text to process"
                value={input}
                onChange={setInput}
                placeholder="Enter text..."
                rows={6}
              />
            </ControlPanel>

            <ControlPanel title="Cipher Method">
              <Select
                value={mode}
                onChange={(e) => setMode(e.target.value as CipherMode)}
              >
                {CIPHER_MODES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </ControlPanel>

            {mode === 'aes' && (
              <ControlPanel title="Secret Key">
                <Input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter secret key"
                />
              </ControlPanel>
            )}

            <div className="flex gap-2">
              <Button onClick={handleEncode} loading={loading} className="flex-1">
                Encode
              </Button>
              <Button onClick={handleDecode} loading={loading} variant="outline" className="flex-1">
                Decode
              </Button>
            </div>
          </div>
        }
        right={
          <div className="space-y-4">
            <ControlPanel title="Output">
              <TextAreaInput label="Result" value={output} onChange={() => { }} readOnly rows={6} />
            </ControlPanel>

            {output && (
              <CopyButton
                value={output}
                onCopy={() => clipboard.copy(output)}
                copied={clipboard.copied}
                disabled={!output}
              />
            )}
          </div>
        }
      />
    </ToolLayout>
  );
}
