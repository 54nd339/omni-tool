'use client';

import { useCallback, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useToolParams } from '@/hooks/use-tool-params';
import { buildCharpool, generateId, generatePassword, getPasswordStrength } from '@/lib/generators';
import type { IdType } from '@/types/common';

import { GeneratorModeSwitch } from './generator-mode-switch';
import { IdGeneratorControls } from './id-generator-controls';
import { parseBooleanParam, parsePasswordLengthParam } from './params';
import { PasswordGeneratorControls } from './password-generator-controls';
import { PasswordStrengthMeter } from './password-strength-meter';
import { ResultsList } from './results-list';

const PARAM_DEFAULTS = {
  idBatchSize: '1',
  idType: 'uuid',
  mode: 'id',
  passwordBatchSize: '1',
  passwordCustom: '',
  passwordDigits: 'true',
  passwordLength: '16',
  passwordLowercase: 'true',
  passwordSymbols: 'true',
  passwordUppercase: 'true',
};

export function UuidGeneratorTool() {
  const [params, setParams] = useToolParams(PARAM_DEFAULTS);
  const [values, setValues] = useState<string[]>([]);

  const mode = params.mode === 'password' ? 'password' : 'id';
  const idType: IdType = params.idType === 'ulid' ? 'ulid' : 'uuid';
  const idBatchSize = params.idBatchSize;

  const passwordBatchSize = params.passwordBatchSize;
  const passwordLength = parsePasswordLengthParam(params.passwordLength);
  const passwordUppercase = parseBooleanParam(params.passwordUppercase, true);
  const passwordLowercase = parseBooleanParam(params.passwordLowercase, true);
  const passwordDigits = parseBooleanParam(params.passwordDigits, true);
  const passwordSymbols = parseBooleanParam(params.passwordSymbols, true);
  const passwordCustom = params.passwordCustom;

  const passwordCharpool = useMemo(
    () =>
      buildCharpool({
        custom: passwordCustom,
        digits: passwordDigits,
        lowercase: passwordLowercase,
        symbols: passwordSymbols,
        uppercase: passwordUppercase,
      }),
    [passwordCustom, passwordDigits, passwordLowercase, passwordSymbols, passwordUppercase],
  );

  const generate = useCallback(() => {
    const count = Number.parseInt(mode === 'id' ? idBatchSize : passwordBatchSize, 10) || 1;
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(
        mode === 'id'
          ? generateId(idType)
          : generatePassword(passwordLength, passwordCharpool),
      );
    }
    setValues(result);
  }, [idType, idBatchSize, mode, passwordBatchSize, passwordCharpool, passwordLength]);

  const strength = mode === 'password' && values[0]
    ? getPasswordStrength(values[0])
    : null;

  const copyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(values.join('\n'));
      toast.success(mode === 'id' ? 'All IDs copied' : 'All passwords copied');
    } catch {
      toast.error('Failed to copy');
    }
  }, [mode, values]);

  return (
    <div className="space-y-6">
      <GeneratorModeSwitch
        mode={mode}
        onModeChange={(nextMode) => setParams({ mode: nextMode })}
      />

      {mode === 'id' ? (
        <IdGeneratorControls
          idType={idType}
          idBatchSize={idBatchSize}
          onIdTypeChange={(value) => setParams({ idType: value })}
          onIdBatchSizeChange={(value) => setParams({ idBatchSize: value })}
        />
      ) : (
        <PasswordGeneratorControls
          length={passwordLength}
          uppercase={passwordUppercase}
          lowercase={passwordLowercase}
          digits={passwordDigits}
          symbols={passwordSymbols}
          custom={passwordCustom}
          batchSize={passwordBatchSize}
          onLengthChange={(value) => setParams({ passwordLength: String(value) })}
          onUppercaseChange={(value) => setParams({ passwordUppercase: String(value) })}
          onLowercaseChange={(value) => setParams({ passwordLowercase: String(value) })}
          onDigitsChange={(value) => setParams({ passwordDigits: String(value) })}
          onSymbolsChange={(value) => setParams({ passwordSymbols: String(value) })}
          onCustomChange={(value) => setParams({ passwordCustom: value })}
          onBatchSizeChange={(value) => setParams({ passwordBatchSize: value })}
        />
      )}

      <div className="flex gap-2">
        <Button onClick={generate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {mode === 'id' ? 'Generate' : 'Generate Passwords'}
        </Button>
        {values.length > 1 && (
          <Button variant="outline" onClick={copyAll}>
            Copy All
          </Button>
        )}
      </div>

      {strength && <PasswordStrengthMeter strength={strength} />}

      <ResultsList values={values} />
    </div>
  );
}
