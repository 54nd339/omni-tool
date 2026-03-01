'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { detectFormat, formatJson, formatYaml, formatXml, convertFormat, parseCsv, jsonToCsv } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Checkbox } from '@/components/ui/checkbox';
import { CopyButton } from '@/components/shared/copy-button';
import { SendToButton } from '@/components/shared/send-to-button';
import { CodeEditor } from '@/components/shared/code-editor';
import { cn, pluralize } from '@/lib/utils';
import type { DataFormat } from '@/types';

type TopTab = 'format' | 'schema' | 'types';
type Kind = 'interface' | 'type';
type OptionalMode = 'required' | 'optional';
type CsvDelimiter = ',' | ';' | '\t';

const FORMATS: DataFormat[] = ['json', 'yaml', 'xml', 'csv'];

/* ---------- Schema inference ---------- */

function inferSchema(value: unknown): Record<string, unknown> {
  if (value === null) return { type: 'null' };
  if (Array.isArray(value)) {
    return { type: 'array', items: value.length > 0 ? inferSchema(value[0]) : {} };
  }
  if (typeof value === 'object') {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      properties[key] = inferSchema(val);
      required.push(key);
    }
    return { type: 'object', properties, required };
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
  }
  return { type: typeof value };
}

/* ---------- TS type generation ---------- */

function toPascalCase(str: string): string {
  return (
    str
      .replace(/(?:^|[-_\s])([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '') || 'Item'
  );
}

function generateInterfaceName(keyHint: string, suffix: string, usedNames: Set<string>): string {
  const base = toPascalCase(keyHint || suffix);
  let name = base;
  let i = 0;
  while (usedNames.has(name)) {
    name = `${base}${i}`;
    i++;
  }
  usedNames.add(name);
  return name;
}

function getTsType(
  value: unknown,
  kind: Kind,
  optional: OptionalMode,
  interfaceMap: Map<string, string>,
  usedNames: Set<string>,
  keyHint: string,
): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const types = new Set<string>();
    for (let i = 0; i < value.length; i++) {
      const elem = value[i];
      if (elem !== null && typeof elem === 'object' && !Array.isArray(elem)) {
        const name =
          interfaceMap.get(JSON.stringify(elem)) ??
          interfaceMap.get(JSON.stringify(value[0])) ??
          generateInterfaceName(keyHint, 'Item', usedNames);
        types.add(name);
      } else {
        types.add(getTsType(elem, kind, optional, interfaceMap, usedNames, `${keyHint}_${i}`));
      }
    }
    const arrTypes = [...types];
    if (arrTypes.length === 1) return `${arrTypes[0]}[]`;
    return `(${arrTypes.join(' | ')})[]`;
  }

  if (typeof value === 'object' && value !== null) {
    return interfaceMap.get(JSON.stringify(value)) ?? 'Record<string, unknown>';
  }

  return 'unknown';
}

function generateInterfaces(
  value: unknown,
  kind: Kind,
  optional: OptionalMode,
  interfaceMap: Map<string, string>,
  usedNames: Set<string>,
  keyHint: string,
): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [];
  const lines: string[] = [];
  const obj = value as Record<string, unknown>;
  const name = interfaceMap.get(JSON.stringify(value));
  if (!name) return lines;

  const entries: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const opt = optional === 'optional' ? '?' : '';
    const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `'${k.replace(/'/g, "\\'")}'`;

    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      const nestedName = interfaceMap.get(JSON.stringify(v));
      if (nestedName) {
        lines.push(...generateInterfaces(v, kind, optional, interfaceMap, usedNames, k));
        entries.push(`  ${key}${opt}: ${nestedName};`);
      } else {
        entries.push(`  ${key}${opt}: Record<string, unknown>;`);
      }
    } else if (Array.isArray(v) && v.length > 0) {
      const first = v[0];
      if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
        const nestedName = interfaceMap.get(JSON.stringify(first));
        if (nestedName) {
          lines.push(...generateInterfaces(first, kind, optional, interfaceMap, usedNames, k));
          entries.push(`  ${key}${opt}: ${nestedName}[];`);
        } else {
          const elemType = getTsType(first, kind, optional, interfaceMap, usedNames, k);
          entries.push(`  ${key}${opt}: ${elemType}[];`);
        }
      } else {
        const elemTypes = new Set<string>();
        for (let i = 0; i < v.length; i++) {
          elemTypes.add(getTsType(v[i], kind, optional, interfaceMap, usedNames, `${k}_${i}`));
        }
        const arrType =
          elemTypes.size === 1 ? [...elemTypes][0] : `(${[...elemTypes].join(' | ')})`;
        entries.push(`  ${key}${opt}: ${arrType}[];`);
      }
    } else {
      const t = getTsType(v, kind, optional, interfaceMap, usedNames, k);
      entries.push(`  ${key}${opt}: ${t};`);
    }
  }

  if (kind === 'interface') {
    lines.push(`interface ${name} {\n${entries.join('\n')}\n}`);
  } else {
    lines.push(`type ${name} = {\n${entries.join('\n')}\n};`);
  }
  return lines;
}

function buildInterfaceMap(
  value: unknown,
  map: Map<string, string>,
  usedNames: Set<string>,
  keyHint: string,
): void {
  if (value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    const first = value[0];
    if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
      const str = JSON.stringify(first);
      if (!map.has(str)) {
        const name = generateInterfaceName(keyHint || 'Item', 'Item', usedNames);
        map.set(str, name);
        buildInterfaceMap(first, map, usedNames, keyHint || 'Item');
      }
    }
    return;
  }
  const str = JSON.stringify(value);
  if (map.has(str)) return;
  const name = generateInterfaceName(keyHint || 'Root', 'Root', usedNames);
  map.set(str, name);
  const obj = value as Record<string, unknown>;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && typeof v === 'object') buildInterfaceMap(v, map, usedNames, k);
  }
}

function jsonToTs(
  input: string,
  kind: Kind,
  optional: OptionalMode,
): { output: string; error: string | null } {
  try {
    const parsed = JSON.parse(input) as unknown;
    const interfaceMap = new Map<string, string>();
    const usedNames = new Set<string>();

    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      buildInterfaceMap(parsed, interfaceMap, usedNames, 'Root');
    } else if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0];
      if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
        buildInterfaceMap(parsed, interfaceMap, usedNames, 'Item');
      }
    }

    const lines: string[] = [];
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      if (interfaceMap.get(JSON.stringify(parsed))) {
        lines.push(...generateInterfaces(parsed, kind, optional, interfaceMap, usedNames, 'Root'));
      }
    } else if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0];
      if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
        lines.push(...generateInterfaces(first, kind, optional, interfaceMap, usedNames, 'Item'));
      }
    }

    if (lines.length === 0) {
      const rootType =
        parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
          ? (interfaceMap.get(JSON.stringify(parsed)) ?? 'Record<string, unknown>')
          : Array.isArray(parsed) && parsed.length > 0
            ? (() => {
              const first = parsed[0];
              if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
                return (interfaceMap.get(JSON.stringify(first)) ?? 'unknown') + '[]';
              }
              const types = new Set<string>();
              for (const v of parsed) types.add(getTsType(v, kind, optional, interfaceMap, usedNames, ''));
              const arr = [...types];
              return arr.length === 1 ? `${arr[0]}[]` : `(${arr.join(' | ')})[]`;
            })()
            : getTsType(parsed, kind, optional, interfaceMap, usedNames, 'Root');
      return { output: `type Root = ${rootType};`, error: null };
    }
    return { output: lines.join('\n\n'), error: null };
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

/* ---------- Tree view ---------- */

function resolveJsonPath(obj: unknown, path: string): unknown[] {
  if (!path || path === '$') return [obj];
  const parts = path.replace(/^\$\.?/, '').split(/\.|\[(\d+)\]/).filter(Boolean);
  let current: unknown[] = [obj];
  for (const part of parts) {
    const next: unknown[] = [];
    for (const item of current) {
      if (item && typeof item === 'object') {
        const key = /^\d+$/.test(part) ? Number(part) : part;
        const val = (item as Record<string | number, unknown>)[key];
        if (val !== undefined) next.push(val);
      }
    }
    current = next;
  }
  return current;
}

function TreeNode({ label, value, depth, highlighted }: { label: string; value: unknown; depth: number; highlighted: boolean }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isObject = value !== null && typeof value === 'object';
  const entries = isObject
    ? Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value as Record<string, unknown>)
    : [];

  const typeColor =
    typeof value === 'string' ? 'text-green-600 dark:text-green-400'
      : typeof value === 'number' ? 'text-blue-600 dark:text-blue-400'
        : typeof value === 'boolean' ? 'text-purple-600 dark:text-purple-400'
          : value === null ? 'text-muted-foreground' : '';

  const preview = isObject ? (Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value as object).length}}`) : '';

  return (
    <div style={{ paddingLeft: depth > 0 ? 16 : 0 }}>
      <div className={cn('group flex items-center gap-1 rounded-sm py-0.5 text-sm', highlighted && 'bg-yellow-100 dark:bg-yellow-900/30')}>
        {isObject ? (
          <button onClick={() => setExpanded(!expanded)} className="shrink-0 text-muted-foreground" aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : <span className="w-3.5" />}
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">:</span>
        {isObject ? <span className="text-muted-foreground">{preview}</span> : (
          <span className={cn('truncate', typeColor)}>{typeof value === 'string' ? `"${value}"` : String(value)}</span>
        )}
        <CopyButton value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)} size="sm" className="ml-1 opacity-0 group-hover:opacity-100" />
      </div>
      {isObject && expanded && (
        <div>{entries.map(([key, val]) => <TreeNode key={key} label={key} value={val} depth={depth + 1} highlighted={false} />)}</div>
      )}
    </div>
  );
}

/* ---------- Validation result ---------- */

interface ValidationResult { valid: boolean; errors: string[] }

const SAMPLE_SCHEMA = `{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer", "minimum": 0 },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["name", "email"]
}`;

/* ---------- Main component ---------- */

export function JsonYamlXmlTool() {
  const searchParams = useSearchParams();
  const [topTab, setTopTab] = useState<TopTab>('format');
  const [input, setInput] = useState(() => {
    const paste = searchParams.get('paste');
    return paste ? decodeURIComponent(paste) : '';
  });

  // Format tab state
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState<DataFormat>('json');
  const [targetFormat, setTargetFormat] = useState<DataFormat>('json');
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text');
  const [jsonPath, setJsonPath] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [csvDelimiter, setCsvDelimiter] = useState<CsvDelimiter>(',');
  const [csvHeaders, setCsvHeaders] = useState(true);

  // Schema tab state
  const [schema, setSchema] = useState(SAMPLE_SCHEMA);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);

  // Types tab state
  const [tsOutput, setTsOutput] = useState('');
  const [tsError, setTsError] = useState<string | null>(null);
  const [tsKind, setTsKind] = useState<Kind>('interface');
  const [tsOptional, setTsOptional] = useState<OptionalMode>('required');

  const isJsonFormat = detectFormat(input) === 'json';
  const isCsvMode = format === 'csv' || targetFormat === 'csv';

  const parsedJson = useMemo(() => {
    if (!input.trim() || !isJsonFormat) return { ok: false as const, error: '', data: null };
    try {
      return { ok: true as const, data: JSON.parse(input) as unknown, error: null };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'Invalid JSON', data: null };
    }
  }, [input, isJsonFormat]);

  const pathResults = useMemo(() => {
    if (!parsedJson.ok || !parsedJson.data || !jsonPath.trim()) return null;
    try { return resolveJsonPath(parsedJson.data, jsonPath); } catch { return null; }
  }, [parsedJson, jsonPath]);

  const handleFormat = useCallback(() => {
    setError(null);
    try {
      const detected = detectFormat(input) ?? format;
      let result: string;
      if (detected === 'json') result = formatJson(input);
      else if (detected === 'yaml') result = formatYaml(input);
      else if (detected === 'csv') { result = JSON.stringify(parseCsv(input, csvDelimiter, csvHeaders), null, 2); }
      else result = formatXml(input);
      setOutput(result);
      setFormat(detected);
      toast.success(`Valid ${detected.toUpperCase()}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid input';
      setError(msg);
      setOutput('');
      toast.error(`Invalid: ${msg}`);
    }
  }, [input, format, csvDelimiter, csvHeaders]);

  const handleConvert = useCallback(() => {
    setError(null);
    try {
      const detected = detectFormat(input) ?? format;
      let result: string;
      if (detected === 'csv') {
        const parsed = parseCsv(input, csvDelimiter, csvHeaders);
        result = targetFormat === 'json' ? JSON.stringify(parsed, null, 2) : convertFormat(JSON.stringify(parsed), 'json', targetFormat);
      } else if (targetFormat === 'csv') {
        const jsonStr = detected === 'json' ? input : convertFormat(input, detected, 'json');
        const data = JSON.parse(jsonStr);
        if (!Array.isArray(data)) throw new Error('Data must be an array for CSV conversion');
        result = jsonToCsv(data, csvDelimiter);
      } else {
        result = convertFormat(input, detected, targetFormat);
      }
      setOutput(result);
      toast.success(`Converted to ${targetFormat.toUpperCase()}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Conversion failed';
      setError(msg);
      toast.error(msg);
    }
  }, [input, format, targetFormat, csvDelimiter, csvHeaders]);

  const handleValidateSchema = useCallback(async () => {
    setValidating(true);
    try {
      const parsedJson = JSON.parse(input);
      const parsedSchema = JSON.parse(schema);
      const Ajv = (await import('ajv')).default;
      const ajv = new Ajv({ allErrors: true });
      const validate = ajv.compile(parsedSchema);
      const valid = validate(parsedJson);
      setValidationResult({
        valid: !!valid,
        errors: validate.errors?.map((e) => `${e.instancePath || '/'}: ${e.message}`) ?? [],
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Validation failed');
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  }, [input, schema]);

  const handleGenerateSchema = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setSchema(JSON.stringify(inferSchema(parsed), null, 2));
      toast.success('Schema generated from JSON');
    } catch { toast.error('Invalid JSON'); }
  }, [input]);

  const handleGenerateTypes = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) { setTsOutput(''); setTsError('Enter JSON to generate types'); return; }
    const result = jsonToTs(trimmed, tsKind, tsOptional);
    setTsOutput(result.output);
    setTsError(result.error);
    if (result.error) toast.error(result.error);
  }, [input, tsKind, tsOptional]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ToggleGroup type="single" value={topTab} onValueChange={(v) => v && setTopTab(v as TopTab)}>
          <ToggleGroupItem value="format">Format &amp; Convert</ToggleGroupItem>
          <ToggleGroupItem value="schema">Schema</ToggleGroupItem>
          <ToggleGroupItem value="types">Types</ToggleGroupItem>
        </ToggleGroup>

        {topTab === 'format' && isJsonFormat && (
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'text' | 'tree')}>
            <ToggleGroupItem value="text">Text</ToggleGroupItem>
            <ToggleGroupItem value="tree">Tree</ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>

      {/* ===== FORMAT TAB ===== */}
      {topTab === 'format' && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col">
              <div className="mb-2 flex h-9 shrink-0 items-center">
                <p className="text-xs font-medium text-muted-foreground">Input</p>
              </div>
              <div className="min-h-[400px] flex-1">
                <CodeEditor value={input} onChange={setInput} language={format} placeholder="Paste JSON, YAML, XML, or CSV..." />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="mb-2 flex h-9 shrink-0 items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">Output</p>
              </div>
              {viewMode === 'text' ? (
                <div className="min-h-[400px] flex-1">
                  <CodeEditor value={output} language={targetFormat} readOnly placeholder="Formatted output appears here..." />
                </div>
              ) : (
                <div className="space-y-4">
                  {parsedJson.ok ? (
                    <>
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">JSONPath Query</p>
                        <Input value={jsonPath} onChange={(e) => setJsonPath(e.target.value)} placeholder="$.store.book[0].title" className="font-mono" />
                        {pathResults && pathResults.length > 0 && (
                          <div className="mt-2 rounded-md border border-border bg-muted/50 p-3">
                            <p className="mb-1 text-xs text-muted-foreground">{pathResults.length} {pluralize(pathResults.length, 'match', 'matches')}</p>
                            {pathResults.map((r, i) => <pre key={i} className="whitespace-pre-wrap text-xs">{typeof r === 'string' ? r : JSON.stringify(r, null, 2)}</pre>)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">Tree</p>
                        <div className="max-h-[500px] overflow-auto rounded-md border border-border p-3">
                          <TreeNode label="$" value={parsedJson.data} depth={0} highlighted={false} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-[400px] items-center justify-center rounded-md border border-border bg-muted/30">
                      {input.trim() ? <p className="text-sm text-destructive">{parsedJson.error}</p> : <p className="text-sm text-muted-foreground">Paste JSON to view tree</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {error && viewMode === 'text' && <p className="text-sm text-red-500">{error}</p>}
          {viewMode === 'text' && (
            <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border border-border bg-muted/10 p-3 pt-4">
              <Button onClick={handleFormat}>Validate &amp; Format</Button>
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground text-center">Convert to</p>
                  <ToggleGroup type="single" value={targetFormat} onValueChange={(v) => v && setTargetFormat(v as DataFormat)}>
                    {FORMATS.map((f) => <ToggleGroupItem key={f} value={f}>{f.toUpperCase()}</ToggleGroupItem>)}
                  </ToggleGroup>
                </div>
                <Button variant="outline" onClick={handleConvert}>Convert</Button>
              </div>
              {output && (
                <div className="flex items-center justify-end gap-3 flex-1 sm:flex-none">
                  <SendToButton value={output} outputType={isJsonFormat ? 'json' : 'text'} />
                  <CopyButton value={output} />
                </div>
              )}
              {isCsvMode && (
                <div className="flex w-full items-center justify-between gap-4 border-t border-border pt-3 mt-1">
                  <div>
                    <ToggleGroup type="single" value={csvDelimiter} onValueChange={(v) => v && setCsvDelimiter(v as CsvDelimiter)}>
                      <ToggleGroupItem value=",">Comma</ToggleGroupItem>
                      <ToggleGroupItem value=";">Semicolon</ToggleGroupItem>
                      <ToggleGroupItem value={'\t'}>Tab</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox checked={csvHeaders} onCheckedChange={(v) => setCsvHeaders(v === true)} />
                    First row is header
                  </label>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===== SCHEMA TAB ===== */}
      {topTab === 'schema' && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col">
              <div className="mb-2 flex h-9 shrink-0 items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">JSON</p>
                <Button variant="ghost" size="sm" onClick={handleGenerateSchema} className="text-xs">Auto-generate Schema</Button>
              </div>
              <div className="min-h-[400px] flex-1">
                <CodeEditor value={input} onChange={setInput} language="json" placeholder="Paste JSON here..." />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="mb-2 flex h-9 shrink-0 items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">JSON Schema</p>
                {schema && <CopyButton value={schema} size="sm" />}
              </div>
              <div className="min-h-[400px] flex-1">
                <CodeEditor value={schema} onChange={setSchema} language="json" placeholder="Paste JSON Schema..." />
              </div>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Button onClick={handleValidateSchema} disabled={validating}>{validating ? 'Validating...' : 'Validate against Schema'}</Button>
          </div>
          {validationResult && (
            <div className={`rounded-md border p-4 ${validationResult.valid ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-destructive bg-red-50 dark:bg-red-950/20'}`}>
              <p className={`text-sm font-medium ${validationResult.valid ? 'text-green-700 dark:text-green-400' : 'text-destructive'}`}>
                {validationResult.valid ? 'Valid -- JSON matches the schema' : `Invalid -- ${validationResult.errors.length} error(s) found`}
              </p>
              {validationResult.errors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {validationResult.errors.map((err, i) => <li key={i} className="text-xs text-destructive">{err}</li>)}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {/* ===== TYPES TAB ===== */}
      {topTab === 'types' && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col">
              <div className="mb-2 flex h-9 shrink-0 items-center">
                <p className="text-xs font-medium text-muted-foreground">JSON</p>
              </div>
              <div className="min-h-[400px] flex-1">
                <CodeEditor value={input} onChange={setInput} language="json" placeholder="Paste JSON here..." />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="mb-2 flex h-9 shrink-0 items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">TypeScript output</p>
                {tsOutput && <CopyButton value={tsOutput} size="sm" />}
              </div>
              <div className="min-h-[400px] flex-1">
                <CodeEditor value={tsOutput} language="typescript" readOnly placeholder="Generated types will appear here..." />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-muted/10 p-3 pt-4 mt-2">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Output style</p>
              <ToggleGroup type="single" value={tsKind} onValueChange={(v) => v && setTsKind(v as Kind)}>
                <ToggleGroupItem value="interface">interface</ToggleGroupItem>
                <ToggleGroupItem value="type">type</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Properties</p>
              <ToggleGroup type="single" value={tsOptional} onValueChange={(v) => v && setTsOptional(v as OptionalMode)}>
                <ToggleGroupItem value="required">Required</ToggleGroupItem>
                <ToggleGroupItem value="optional">Optional</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex-1 min-w-[120px]" />
            <Button onClick={handleGenerateTypes}>Generate TypeScript</Button>
          </div>
          {tsError && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">{tsError}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
