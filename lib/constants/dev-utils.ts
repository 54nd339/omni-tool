import type { DiffMode } from '@/types/common';
import type { RegexTesterParams } from '@/types/dev-utils';

export {
  DIAGRAM_TEMPLATES,
  type DiagramTemplate,
} from './dev-utils/diagram-template';
export {
  ADDRESS_SUFFIXES,
  CITIES,
  COMPANIES,
  COUNTRIES,
  DEFAULT_FIELDS,
  EMAIL_DOMAINS,
  FIELD_TYPES,
  FIRST_NAMES,
  JOB_TITLES,
  LAST_NAMES,
  URL_TLDS,
  WORDS,
} from './dev-utils/fake-data';
export { REGEX_LIBRARY_PATTERNS } from './dev-utils/regex-libraries';

export type FormatterLanguage =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'markdown'
  | 'sql';

interface FormatterLanguageOption {
  id: FormatterLanguage;
  label: string;
  parser: string;
}

export const FORMATTER_LANGUAGES = [
  { id: 'html', label: 'HTML', parser: 'html' },
  { id: 'css', label: 'CSS', parser: 'css' },
  { id: 'javascript', label: 'JavaScript', parser: 'babel' },
  { id: 'typescript', label: 'TypeScript', parser: 'babel-ts' },
  { id: 'json', label: 'JSON', parser: 'json' },
  { id: 'markdown', label: 'Markdown', parser: 'markdown' },
  { id: 'sql', label: 'SQL', parser: 'sql' },
] as const satisfies readonly FormatterLanguageOption[];

interface DiffModeOption {
  id: DiffMode;
  label: string;
}

interface DiffLanguageOption {
  id: string;
  label: string;
}

export const DIFF_MODES = [
  { id: 'line', label: 'Lines' },
  { id: 'word', label: 'Words' },
  { id: 'char', label: 'Characters' },
  { id: 'sentence', label: 'Sentences' },
  { id: 'json', label: 'JSON' },
] as const satisfies readonly DiffModeOption[];

export const DIFF_LANGUAGES = [
  { id: 'plaintext', label: 'Plain Text' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'json', label: 'JSON' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'python', label: 'Python' },
  { id: 'sql', label: 'SQL' },
  { id: 'yaml', label: 'YAML' },
  { id: 'xml', label: 'XML' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'markdown', label: 'Markdown' },
] as const satisfies readonly DiffLanguageOption[];

export const REGEX_TESTER_FLAG_OPTIONS = [
  { id: 'g', label: 'Global (g)' },
  { id: 'i', label: 'Case insensitive (i)' },
  { id: 'm', label: 'Multiline (m)' },
  { id: 's', label: 'Dotall (s)' },
] as const;

export const REGEX_TESTER_CHEAT_SHEET = [
  { pattern: '.', desc: 'Any character' },
  { pattern: '\\d', desc: 'Digit [0-9]' },
  { pattern: '\\w', desc: 'Word char [a-zA-Z0-9_]' },
  { pattern: '\\s', desc: 'Whitespace' },
  { pattern: '^', desc: 'Start of string/line' },
  { pattern: '$', desc: 'End of string/line' },
  { pattern: '*', desc: '0 or more' },
  { pattern: '+', desc: '1 or more' },
  { pattern: '?', desc: '0 or 1' },
  { pattern: '{n,m}', desc: 'Between n and m' },
  { pattern: '(abc)', desc: 'Capture group' },
  { pattern: '(?:abc)', desc: 'Non-capture group' },
  { pattern: '(?=abc)', desc: 'Positive lookahead' },
  { pattern: '[abc]', desc: 'Character class' },
  { pattern: '[^abc]', desc: 'Negated class' },
  { pattern: 'a|b', desc: 'Alternation' },
] as const;

export const REGEX_TESTER_PARAM_DEFAULTS = {
  pattern: '',
  flags: 'g',
  replace: '0',
  replacement: '',
  test: '',
} as const satisfies RegexTesterParams;

export const REGEX_TESTER_ALLOWED_FLAGS: ReadonlySet<string> = new Set(
  REGEX_TESTER_FLAG_OPTIONS.map((option) => option.id),
);

export const DEV_MISC_TABS = [
  { id: 'byte-counter', label: 'Byte Counter' },
  { id: 'chmod', label: 'Chmod Calculator' },
  { id: 'og-preview', label: 'OG Preview' },
  { id: 'url-parser', label: 'URL Parser' },
  { id: 'fake-data', label: 'Fake Data' },
] as const;

export type DevMiscTabId = (typeof DEV_MISC_TABS)[number]['id'];

export const TEXT_ENCODER_TABS = [
  { id: 'base64', label: 'Base64' },
  { id: 'url', label: 'URL Encode' },
  { id: 'html', label: 'HTML Entities' },
  { id: 'case', label: 'Text Case' },
] as const;

export type TextEncoderTab = (typeof TEXT_ENCODER_TABS)[number]['id'];
