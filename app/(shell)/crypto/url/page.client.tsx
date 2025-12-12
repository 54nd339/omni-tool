'use client';

import { useState } from 'react';
import { ToolLayout, TwoColumnLayout, ControlPanel, TextAreaInput, Button, CopyButton, Select } from '@/app/components/shared';
import { encodeText, decodeText, formatErrorMessage } from '@/app/lib/utils';
import { useClipboard } from '@/app/lib/hooks';
import { CRYPTO_DEFAULTS } from '@/app/lib/constants';
import type { EncodingType } from '@/app/lib/types/crypto';

export default function UrlPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [encodingType, setEncodingType] = useState<EncodingType>(CRYPTO_DEFAULTS.URL_ENCODING_TYPE);
  const clipboard = useClipboard();

  const handleEncode = () => {
    if (!input) return;
    try {
      const result = encodeText[encodingType](input);
      setOutput(result);
    } catch (error) {
      setOutput(formatErrorMessage(error));
    }
  };

  const handleDecode = () => {
    if (!input) return;
    try {
      const result = decodeText[encodingType](input);
      setOutput(result);
    } catch (error) {
      setOutput(formatErrorMessage(error));
    }
  };

  return (
    <ToolLayout path="/crypto/url">
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

            <ControlPanel title="Encoding Type">
              <Select
                value={encodingType}
                onChange={(e) => setEncodingType(e.target.value as EncodingType)}
              >
                <option value="base64">Base64</option>
                <option value="url">URL Encode</option>
                <option value="html">HTML Entities</option>
                <option value="uri">URI Encode</option>
              </Select>
            </ControlPanel>

            <div className="flex gap-2">
              <Button onClick={handleEncode} className="flex-1">
                Encode
              </Button>
              <Button onClick={handleDecode} variant="outline" className="flex-1">
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
