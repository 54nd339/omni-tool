interface CaseOption {
  id: string;
  label: string;
  fn: (value: string) => string;
}

function toWords(value: string): string[] {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-./\\]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export const TEXT_CASES = [
  { id: 'upper', label: 'UPPER CASE', fn: (value) => value.toUpperCase() },
  { id: 'lower', label: 'lower case', fn: (value) => value.toLowerCase() },
  {
    id: 'title',
    label: 'Title Case',
    fn: (value) => toWords(value).map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' '),
  },
  {
    id: 'sentence',
    label: 'Sentence case',
    fn: (value) => {
      const lowered = value.toLowerCase();
      return lowered.replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
    },
  },
  {
    id: 'camel',
    label: 'camelCase',
    fn: (value) => {
      const words = toWords(value);
      return words
        .map((word, index) => (index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase()))
        .join('');
    },
  },
  {
    id: 'pascal',
    label: 'PascalCase',
    fn: (value) => toWords(value).map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(''),
  },
  {
    id: 'snake',
    label: 'snake_case',
    fn: (value) => toWords(value).map((word) => word.toLowerCase()).join('_'),
  },
  {
    id: 'kebab',
    label: 'kebab-case',
    fn: (value) => toWords(value).map((word) => word.toLowerCase()).join('-'),
  },
  {
    id: 'constant',
    label: 'CONSTANT_CASE',
    fn: (value) => toWords(value).map((word) => word.toUpperCase()).join('_'),
  },
  {
    id: 'dot',
    label: 'dot.case',
    fn: (value) => toWords(value).map((word) => word.toLowerCase()).join('.'),
  },
  {
    id: 'path',
    label: 'path/case',
    fn: (value) => toWords(value).map((word) => word.toLowerCase()).join('/'),
  },
] as const satisfies readonly CaseOption[];