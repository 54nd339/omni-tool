import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import cronstrue from 'cronstrue';
import Ajv from 'ajv';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as yaml from 'js-yaml';
import { diffLines, diffWords, diffChars, diffSentences, Change } from 'diff';
import { DiffMode, SchemaValidation, ToolResult } from '@/app/lib/types';
import { formatErrorMessage } from '@/app/lib/utils';

dayjs.extend(utc);
dayjs.extend(timezone);

const ajv = new Ajv({ allErrors: true });
const xmlParser = new XMLParser({ ignoreAttributes: false });
const xmlBuilder = new XMLBuilder({ ignoreAttributes: false, format: true });

export const convertUnixTimestamp = (timestamp: string): ToolResult => {
  const num = parseInt(timestamp, 10);
  if (Number.isNaN(num)) {
    return { error: 'Invalid timestamp' };
  }

  const date = dayjs.unix(num);
  const formatted = [
    `ISO: ${date.toISOString()}`,
    `Local: ${date.format('YYYY-MM-DD HH:mm:ss')}`,
    `UTC: ${date.utc().format('YYYY-MM-DD HH:mm:ss')}`,
  ].join('\n');

  return { result: formatted };
};

export const convertDateTime = (date: string): ToolResult => {
  const parsed = dayjs(date);
  if (!parsed.isValid()) {
    return { error: 'Invalid date' };
  }

  const ts = parsed.unix();
  const formatted = [
    `Unix: ${ts}`,
    `ISO: ${parsed.toISOString()}`,
    `Local: ${parsed.format('YYYY-MM-DD HH:mm:ss')}`,
    `UTC: ${parsed.utc().format('YYYY-MM-DD HH:mm:ss')}`,
  ].join('\n');

  return { result: formatted };
};

export const describeCronExpression = (cron: string): ToolResult => {
  try {
    const description = cronstrue.toString(cron);
    return { result: description };
  } catch (error) {
    const message = formatErrorMessage(error, 'Unable to describe cron expression');
    return { error: `Error: ${message}` };
  }
};

export const formatJson = (input: string): ToolResult => {
  try {
    const parsed = JSON.parse(input);
    return { result: JSON.stringify(parsed, null, 2) };
  } catch (error) {
    const message = formatErrorMessage(error, 'Invalid JSON');
    return { error: message };
  }
};

export const validateJsonAgainstSchema = (input: string, schema: string): SchemaValidation => {
  try {
    const parsed = JSON.parse(input);
    const schemaObj = JSON.parse(schema);
    const validate = ajv.compile(schemaObj);
    const valid = validate(parsed);

    if (valid) {
      return { output: JSON.stringify(parsed, null, 2), validation: { valid: true } };
    }

    const errors = validate.errors?.map((err) => `${err.instancePath || '/'} ${err.message}`.trim()) || [];
    return { validation: { valid: false, errors } };
  } catch (error) {
    const message = formatErrorMessage(error, 'Validation failed');
    return { error: message };
  }
};

export const minifyJson = (input: string): ToolResult => {
  try {
    const parsed = JSON.parse(input);
    return { result: JSON.stringify(parsed) };
  } catch (error) {
    const message = formatErrorMessage(error, 'Invalid JSON');
    return { error: message };
  }
};

export const formatXml = (input: string): ToolResult => {
  try {
    const parsed = xmlParser.parse(input);
    const formatted = xmlBuilder.build(parsed);
    return { result: formatted };
  } catch (error) {
    const message = formatErrorMessage(error, 'Invalid XML');
    return { error: message };
  }
};

export const yamlToJson = (input: string): ToolResult => {
  try {
    const parsed = yaml.load(input);
    return { result: JSON.stringify(parsed, null, 2) };
  } catch (error) {
    const message = formatErrorMessage(error, 'Invalid YAML');
    return { error: message };
  }
};

export const computeDiff = (text1: string, text2: string, mode: DiffMode): Change[] => {
  switch (mode) {
    case 'words':
      return diffWords(text1, text2);
    case 'chars':
      return diffChars(text1, text2);
    case 'sentences':
      return diffSentences(text1, text2);
    case 'lines':
    default:
      return diffLines(text1, text2);
  }
};

export const diffToText = (parts: Change[]): string =>
  parts
    .map((part) => {
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      return part.value
        .split('\n')
        .filter(Boolean)
        .map((line) => `${prefix}${line}`)
        .join('\n');
    })
    .join('\n');
