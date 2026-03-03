'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useToolParams } from '@/hooks/use-tool-params';
import {
  convertFormat,
  detectFormat,
  formatJson,
  formatXml,
  formatYaml,
  jsonToCsv,
  parseCsv,
} from '@/lib/dev-utils/formatters';
import {
  type CsvDelimiter,
  inferSchema,
  jsonToTs,
  type OptionalMode,
  resolveJsonPath,
  SAMPLE_JSON_SCHEMA,
  type TsKind,
  type ValidationResult,
} from '@/lib/dev-utils/json-yaml-xml';
import type { DataFormat } from '@/types/common';

type JsonYamlXmlTopTab = 'format' | 'schema' | 'types';

export function useJsonYamlXml(initialInput: string) {
  const [params, setParams] = useToolParams({ format: 'json', targetFormat: 'json' });
  const [topTab, setTopTab] = useState<JsonYamlXmlTopTab>('format');
  const [input, setInput] = useState(initialInput);

  const [output, setOutput] = useState('');
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text');
  const [jsonPath, setJsonPath] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [csvDelimiter, setCsvDelimiter] = useState<CsvDelimiter>(',');
  const [csvHeaders, setCsvHeaders] = useState(true);

  const [schema, setSchema] = useState(SAMPLE_JSON_SCHEMA);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);

  const [tsOutput, setTsOutput] = useState('');
  const [tsError, setTsError] = useState<string | null>(null);
  const [tsKind, setTsKind] = useState<TsKind>('interface');
  const [tsOptional, setTsOptional] = useState<OptionalMode>('required');

  const format = params.format as DataFormat;
  const targetFormat = params.targetFormat as DataFormat;

  const setTargetFormat = useCallback(
    (nextTargetFormat: DataFormat) => setParams({ targetFormat: nextTargetFormat }),
    [setParams],
  );

  const isJsonFormat = detectFormat(input) === 'json';
  const isCsvMode = format === 'csv' || targetFormat === 'csv';

  const parsedJson = useMemo(() => {
    if (!input.trim() || !isJsonFormat) return { ok: false as const, error: '', data: null };
    try {
      return { ok: true as const, data: JSON.parse(input) as unknown, error: null };
    } catch (parseError) {
      return {
        ok: false as const,
        error: parseError instanceof Error ? parseError.message : 'Invalid JSON',
        data: null,
      };
    }
  }, [input, isJsonFormat]);

  const pathResults = useMemo(() => {
    if (!parsedJson.ok || !parsedJson.data || !jsonPath.trim()) return null;
    try {
      return resolveJsonPath(parsedJson.data, jsonPath);
    } catch {
      return null;
    }
  }, [parsedJson, jsonPath]);

  const handleFormat = useCallback(() => {
    setError(null);
    try {
      const detected = detectFormat(input) ?? format;
      let result: string;

      if (detected === 'json') {
        result = formatJson(input);
      } else if (detected === 'yaml') {
        result = formatYaml(input);
      } else if (detected === 'csv') {
        result = JSON.stringify(parseCsv(input, csvDelimiter, csvHeaders), null, 2);
      } else {
        result = formatXml(input);
      }

      setOutput(result);
      setParams({ format: detected });
      toast.success(`Valid ${detected.toUpperCase()}`);
    } catch (formatError) {
      const message = formatError instanceof Error ? formatError.message : 'Invalid input';
      setError(message);
      setOutput('');
      toast.error(`Invalid: ${message}`);
    }
  }, [csvDelimiter, csvHeaders, format, input, setParams]);

  const handleConvert = useCallback(() => {
    setError(null);
    try {
      const detected = detectFormat(input) ?? format;
      let result: string;

      if (detected === 'csv') {
        const parsed = parseCsv(input, csvDelimiter, csvHeaders);
        result =
          targetFormat === 'json'
            ? JSON.stringify(parsed, null, 2)
            : convertFormat(JSON.stringify(parsed), 'json', targetFormat);
      } else if (targetFormat === 'csv') {
        const jsonString = detected === 'json' ? input : convertFormat(input, detected, 'json');
        const data = JSON.parse(jsonString);
        if (!Array.isArray(data)) throw new Error('Data must be an array for CSV conversion');
        result = jsonToCsv(data, csvDelimiter);
      } else {
        result = convertFormat(input, detected, targetFormat);
      }

      setOutput(result);
      toast.success(`Converted to ${targetFormat.toUpperCase()}`);
    } catch (convertError) {
      const message = convertError instanceof Error ? convertError.message : 'Conversion failed';
      setError(message);
      toast.error(message);
    }
  }, [input, format, targetFormat, csvDelimiter, csvHeaders]);

  const handleValidateSchema = useCallback(async () => {
    setValidating(true);
    try {
      const parsedJsonInput = JSON.parse(input);
      const parsedSchema = JSON.parse(schema);
      const Ajv = (await import('ajv')).default;
      const ajv = new Ajv({ allErrors: true });
      const validate = ajv.compile(parsedSchema);
      const valid = validate(parsedJsonInput);
      setValidationResult({
        valid: !!valid,
        errors: validate.errors?.map((item) => `${item.instancePath || '/'}: ${item.message}`) ?? [],
      });
    } catch (validateError) {
      toast.error(validateError instanceof Error ? validateError.message : 'Validation failed');
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
    } catch {
      toast.error('Invalid JSON');
    }
  }, [input]);

  const handleGenerateTypes = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setTsOutput('');
      setTsError('Enter JSON to generate types');
      return;
    }

    const result = jsonToTs(trimmed, tsKind, tsOptional);
    setTsOutput(result.output);
    setTsError(result.error);
    if (result.error) toast.error(result.error);
  }, [input, tsKind, tsOptional]);

  return {
    csvDelimiter,
    csvHeaders,
    error,
    format,
    handleConvert,
    handleFormat,
    handleGenerateSchema,
    handleGenerateTypes,
    handleValidateSchema,
    input,
    isCsvMode,
    isJsonFormat,
    jsonPath,
    output,
    parsedJson,
    pathResults,
    schema,
    setCsvDelimiter,
    setCsvHeaders,
    setInput,
    setJsonPath,
    setSchema,
    setTargetFormat,
    setTopTab,
    setTsKind,
    setTsOptional,
    setViewMode,
    targetFormat,
    topTab,
    tsError,
    tsKind,
    tsOptional,
    tsOutput,
    validating,
    validationResult,
    viewMode,
  };
}