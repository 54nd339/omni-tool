'use client';

import type { Plugin } from 'prettier';
import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { CopyButton } from '@/components/shared/copy-button';
import { SendToButton } from '@/components/shared/send-to-button';

type Language = 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'markdown' | 'sql';

const LANGUAGES: { id: Language; label: string; parser: string }[] = [
  { id: 'html', label: 'HTML', parser: 'html' },
  { id: 'css', label: 'CSS', parser: 'css' },
  { id: 'javascript', label: 'JavaScript', parser: 'babel' },
  { id: 'typescript', label: 'TypeScript', parser: 'babel-ts' },
  { id: 'json', label: 'JSON', parser: 'json' },
  { id: 'markdown', label: 'Markdown', parser: 'markdown' },
  { id: 'sql', label: 'SQL', parser: 'sql' },
];

export function CodeFormatterTool() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<Language>('javascript');
  const [input, setInput] = useState(() => {
    const paste = searchParams.get('paste');
    return paste ? decodeURIComponent(paste) : '';
  });
  const [output, setOutput] = useState('');
  const [tabWidth, setTabWidth] = useState(2);
  const [singleQuote, setSingleQuote] = useState(true);
  const [semicolons, setSemicolons] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleFormat = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const langDef = LANGUAGES.find((l) => l.id === language);
      if (!langDef) return;

      if (langDef.parser === 'sql') {
        const { format: formatSql } = await import('sql-formatter');
        const formatted = formatSql(input, { tabWidth, keywordCase: 'upper' });
        setOutput(formatted);
      } else {
        const prettier = await import('prettier/standalone');

        let plugins: Plugin[] = [];
        if (langDef.parser === 'html') {
          plugins = [(await import('prettier/plugins/html')).default];
        } else if (langDef.parser === 'css') {
          plugins = [(await import('prettier/plugins/postcss')).default];
        } else if (langDef.parser === 'babel' || langDef.parser === 'babel-ts') {
          plugins = [(await import('prettier/plugins/babel')).default, (await import('prettier/plugins/estree')).default, (await import('prettier/plugins/typescript')).default];
        } else if (langDef.parser === 'markdown') {
          plugins = [(await import('prettier/plugins/markdown')).default];
        } else if (langDef.parser === 'json') {
          plugins = [(await import('prettier/plugins/babel')).default, (await import('prettier/plugins/estree')).default];
        }

        const formatted = await prettier.format(input, {
          parser: langDef.parser === 'json' ? 'json' : langDef.parser,
          plugins,
          tabWidth,
          singleQuote,
          semi: semicolons,
        });
        setOutput(formatted);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Formatting failed');
      setOutput('');
    } finally {
      setLoading(false);
    }
  }, [input, language, tabWidth, singleQuote, semicolons]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Language</p>
          <ToggleGroup
            type="single"
            value={language}
            onValueChange={(v) => v && setLanguage(v as Language)}
          >
            {LANGUAGES.map((l) => (
              <ToggleGroupItem key={l.id} value={l.id}>
                {l.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="min-w-[150px]">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Tab Width: {tabWidth}</p>
            <Slider min={1} max={8} step={1} value={[tabWidth]} onValueChange={([v]) => setTabWidth(v)} />
          </div>
          <label className="flex items-center gap-2 text-sm mt-6">
            <Checkbox checked={singleQuote} onCheckedChange={(v) => setSingleQuote(v === true)} />
            Single Quotes
          </label>
          <label className="flex items-center gap-2 text-sm mt-6">
            <Checkbox checked={semicolons} onCheckedChange={(v) => setSemicolons(v === true)} />
            Semicolons
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleFormat} disabled={loading || !input.trim()}>
            {loading ? 'Formatting...' : 'Format'}
          </Button>
          {output && (
            <>
              <SendToButton value={output} outputType="code" />
              <CopyButton value={output} />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Input</p>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste code to format..."
            rows={14}
            className="font-mono text-sm"
            autoFocus
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Formatted</p>
          <Textarea
            value={output}
            readOnly
            rows={14}
            className="font-mono text-sm"
            placeholder="Formatted code appears here..."
          />
        </div>
      </div>

    </div>
  );
}
