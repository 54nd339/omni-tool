'use client';

import { useCallback, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CopyButton } from '@/components/shared/copy-button';

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function generatePassword(length: number, charpool: string): string {
  const arr = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(arr, (v) => charpool[v % charpool.length]).join('');
}

function getStrength(password: string): { label: string; color: string; score: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 20) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-destructive', score };
  if (score <= 4) return { label: 'Medium', color: 'bg-yellow-500', score };
  return { label: 'Strong', color: 'bg-green-500', score };
}

const BATCH_SIZES = ['1', '5', '10'] as const;

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [custom, setCustom] = useState('');
  const [batchSize, setBatchSize] = useState('1');
  const [passwords, setPasswords] = useState<string[]>([]);

  const charpool = useMemo(() => {
    let pool = '';
    if (uppercase) pool += CHARSETS.uppercase;
    if (lowercase) pool += CHARSETS.lowercase;
    if (digits) pool += CHARSETS.digits;
    if (symbols) pool += CHARSETS.symbols;
    if (custom) pool += custom;
    return pool || CHARSETS.lowercase;
  }, [uppercase, lowercase, digits, symbols, custom]);

  const generate = useCallback(() => {
    const count = parseInt(batchSize);
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(generatePassword(length, charpool));
    }
    setPasswords(result);
  }, [length, charpool, batchSize]);

  const copyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(passwords.join('\n'));
      toast.success('All passwords copied');
    } catch {
      toast.error('Failed to copy');
    }
  }, [passwords]);

  const strength = passwords.length > 0 ? getStrength(passwords[0]) : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Length: {length}
        </p>
        <Slider min={4} max={128} step={1} value={[length]} onValueChange={([v]) => setLength(v)} />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={uppercase} onCheckedChange={(v) => setUppercase(v === true)} />
          Uppercase
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={lowercase} onCheckedChange={(v) => setLowercase(v === true)} />
          Lowercase
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={digits} onCheckedChange={(v) => setDigits(v === true)} />
          Digits
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={symbols} onCheckedChange={(v) => setSymbols(v === true)} />
          Symbols
        </label>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Custom Characters</p>
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Add custom characters..."
          className="font-mono"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Batch</p>
          <ToggleGroup
            type="single"
            value={batchSize}
            onValueChange={(v) => v && setBatchSize(v)}
          >
            {BATCH_SIZES.map((s) => (
              <ToggleGroupItem key={s} value={s}>
                {s}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={generate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate
        </Button>
        {passwords.length > 1 && (
          <Button variant="outline" onClick={copyAll}>
            Copy All
          </Button>
        )}
      </div>

      {strength && (
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${strength.color}`}
              style={{ width: `${(strength.score / 6) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{strength.label}</span>
        </div>
      )}

      {passwords.length > 0 && (
        <div className="space-y-1">
          {passwords.map((pw, i) => (
            <div
              key={`${pw}-${i}`}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <code className="text-sm break-all">{pw}</code>
              <CopyButton value={pw} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
