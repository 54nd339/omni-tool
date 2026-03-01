'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/shared/copy-button';
import { useDownload } from '@/hooks';

const FONTS = [
  'Standard',
  'Banner',
  'Big',
  'Block',
  'Slant',
  'Script',
  'Shadow',
  'Lean',
  'Small',
  'Mini',
  'Digital',
  'Bubble',
  'Ivrit',
  'Colossal',
  'Doom',
  'Larry 3D',
  'Isometric1',
  'Ogre',
] as const;

type FigletTextFn = (
  text: string,
  options: { font: string },
  callback: (err: Error | null, result?: string) => void,
) => void;

let figletText: FigletTextFn | null = null;

async function loadFiglet(): Promise<FigletTextFn> {
  if (figletText) return figletText;
  const mod = await import('figlet');
  mod.default.defaults({ fontPath: 'https://unpkg.com/figlet/fonts' });
  figletText = mod.default.text as unknown as FigletTextFn;
  return figletText;
}

export function AsciiArtTool() {
  const { download } = useDownload();
  const [text, setText] = useState('Hello');
  const [font, setFont] = useState<string>('Standard');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async (input: string, selectedFont: string) => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    setLoading(true);
    try {
      const fn = await loadFiglet();
      fn(input, { font: selectedFont }, (err, result) => {
        if (err) {
          setOutput(`Error: ${err.message}`);
        } else {
          setOutput(result ?? '');
        }
        setLoading(false);
      });
    } catch (e) {
      setOutput(`Error loading font: ${e instanceof Error ? e.message : 'unknown'}`);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => generate(text, font), 200);
    return () => clearTimeout(timer);
  }, [text, font, generate]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    download(blob, 'ascii-art.txt');
  }, [output, download]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something..."
          className="flex-1"
        />
        <Select value={font} onValueChange={setFont}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            {loading ? 'Generating...' : 'Preview'}
          </p>
          <div className="flex items-center gap-2">
            {output && <CopyButton value={output} size="sm" />}
            {output && (
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="mr-1 h-3 w-3" />
                .txt
              </Button>
            )}
          </div>
        </div>
        <pre className="overflow-x-auto rounded-md border border-border bg-muted/50 p-4 font-mono text-xs leading-tight">
          {output || 'Type something above to generate ASCII art...'}
        </pre>
      </div>
    </div>
  );
}
