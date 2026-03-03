'use client';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { SendToButton } from '@/components/shared/tool-actions/send-to-button';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCodeFormatter } from '@/hooks/use-code-formatter';
import {
  FORMATTER_LANGUAGES,
  type FormatterLanguage,
} from '@/lib/constants/dev-utils';

export function CodeFormatterTool() {
  const {
    handleFormat,
    input,
    language,
    loading,
    output,
    semicolons,
    setInput,
    setLanguage,
    setSemicolons,
    setSingleQuote,
    setTabWidth,
    singleQuote,
    tabWidth,
  } = useCodeFormatter();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Language</p>
          <ToggleGroup
            type="single"
            value={language}
            onValueChange={(v) => v && setLanguage(v as FormatterLanguage)}
          >
            {FORMATTER_LANGUAGES.map((l) => (
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
