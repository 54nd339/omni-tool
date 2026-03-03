import type { Plugin } from 'prettier';

import {
  FORMATTER_LANGUAGES,
  type FormatterLanguage,
} from '@/lib/constants/dev-utils';

export interface FormatCodeOptions {
  input: string;
  language: FormatterLanguage;
  semicolons: boolean;
  singleQuote: boolean;
  tabWidth: number;
}

export async function formatCode(options: FormatCodeOptions): Promise<string> {
  const { input, language, semicolons, singleQuote, tabWidth } = options;
  const languageDef = FORMATTER_LANGUAGES.find((item) => item.id === language);
  if (!languageDef) {
    throw new Error('Unsupported language');
  }

  if (languageDef.parser === 'sql') {
    const { format } = await import('sql-formatter');
    return format(input, { keywordCase: 'upper', tabWidth });
  }

  const prettier = await import('prettier/standalone');
  let plugins: Plugin[] = [];

  if (languageDef.parser === 'html') {
    plugins = [(await import('prettier/plugins/html')).default];
  } else if (languageDef.parser === 'css') {
    plugins = [(await import('prettier/plugins/postcss')).default];
  } else if (
    languageDef.parser === 'babel' ||
    languageDef.parser === 'babel-ts'
  ) {
    plugins = [
      (await import('prettier/plugins/babel')).default,
      (await import('prettier/plugins/estree')).default,
      (await import('prettier/plugins/typescript')).default,
    ];
  } else if (languageDef.parser === 'markdown') {
    plugins = [(await import('prettier/plugins/markdown')).default];
  } else if (languageDef.parser === 'json') {
    plugins = [
      (await import('prettier/plugins/babel')).default,
      (await import('prettier/plugins/estree')).default,
    ];
  }

  return prettier.format(input, {
    parser: languageDef.parser === 'json' ? 'json' : languageDef.parser,
    plugins,
    semi: semicolons,
    singleQuote,
    tabWidth,
  });
}