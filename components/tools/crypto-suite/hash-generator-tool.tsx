'use client';

import { useEffect, useState } from 'react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { SendToButton } from '@/components/shared/tool-actions/send-to-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToolParams } from '@/hooks/use-tool-params';
import { HASH_ALGORITHMS } from '@/lib/constants/crypto';
import { computeHash } from '@/lib/crypto/hash';
import type { HashAlgorithm } from '@/types/common';

const PARAM_DEFAULTS = {
  algorithm: 'SHA256',
  input: '',
};

export function HashGeneratorTool() {
  const [params, setParams] = useToolParams(PARAM_DEFAULTS);
  const [key, setKey] = useState('');
  const [hash, setHash] = useState('');

  const input = params.input;
  const algorithm: HashAlgorithm = HASH_ALGORITHMS.some((item) => item.id === params.algorithm as HashAlgorithm)
    ? (params.algorithm as HashAlgorithm)
    : 'SHA256';

  const needsKey = HASH_ALGORITHMS.find((item) => item.id === algorithm)?.needsKey ?? false;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const result = input ? await computeHash(algorithm, input, key) : '';
      if (!cancelled) {
        setHash(result);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [input, algorithm, key]);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Algorithm
        </p>
        <ToggleGroup
          type="single"
          value={algorithm}
          onValueChange={(v) => v && setParams({ algorithm: v as HashAlgorithm })}
        >
          {HASH_ALGORITHMS.map((item) => (
            <ToggleGroupItem key={item.id} value={item.id}>
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {needsKey && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Secret key
          </p>
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter secret key"
          />
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Input
        </p>
        <Textarea
          value={input}
          onChange={(e) => setParams({ input: e.target.value })}
          placeholder="Type or paste text to hash..."
          rows={6}
          autoFocus
        />
      </div>

      {hash && (
        <div className="relative">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {algorithm} Hash
          </p>
          <div className="flex items-start gap-2 rounded-md border border-border p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-sm">
              {hash}
            </code>
            <SendToButton value={hash} outputType="hash" />
            <CopyButton value={hash} />
          </div>
        </div>
      )}
    </div>
  );
}
