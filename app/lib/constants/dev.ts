import { DiffMode } from '@/app/lib/types';

export const DIFF_MODES: Array<{ value: DiffMode; label: string }> = [
  { value: 'lines', label: 'Line by Line' },
  { value: 'words', label: 'Word by Word' },
  { value: 'chars', label: 'Character by Character' },
  { value: 'sentences', label: 'Sentence by Sentence' },
] as const;

export const DEV_DEFAULTS = {
  JSON_INPUT: '{"name":"OmniTool","version":"1.0"}',
  JSON_SCHEMA: '{"type":"object","properties":{"name":{"type":"string"},"version":{"type":"string"}}}',
  XML_INPUT: '<?xml version="1.0"?>\n<root>\n  <item>value</item>\n</root>',
  YAML_INPUT: 'name: OmniTool\nversion: 1.0\nauthor: Team',
  DIFF_TEXT1: 'Hello World',
  DIFF_TEXT2: 'Hello Universe',
  DIFF_MODE: 'lines' as DiffMode,
  CRON_EXPRESSION: '0 0 * * *',
} as const;
