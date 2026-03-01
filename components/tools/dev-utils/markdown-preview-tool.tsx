'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { Download, FileText } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { useDownload } from '@/hooks';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared/copy-button';

const DEFAULT_MD = `# Markdown Editor

Write **Markdown** on the left and see the preview on the right.

## Features

- Live preview
- Copy rendered HTML
- Export as HTML file
- Export as PDF via print dialog

### Code block

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('World'));
\`\`\`

### Table

| Feature | Status |
| ------- | ------ |
| Bold    | ✓      |
| Links   | ✓      |
| Images  | ✓      |

> Blockquotes work too!

---

[Learn Markdown](https://commonmark.org/help/)
`;

const THEME_VARS = {
  light: {
    bg: '#ffffff', fg: '#1a1a1a', muted: '#f4f4f5',
    border: '#e4e4e7', mutedFg: '#52525b', link: '#2563eb',
  },
  dark: {
    bg: '#09090b', fg: '#fafafa', muted: '#27272a',
    border: '#3f3f46', mutedFg: '#a1a1aa', link: '#60a5fa',
  },
} as const;

const HTML_TEMPLATE = (body: string, theme: 'light' | 'dark' = 'light') => {
  const t = THEME_VARS[theme];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: ${t.fg}; background: ${t.bg}; }
  pre { background: ${t.muted}; padding: 1rem; border-radius: 6px; overflow-x: auto; }
  code { background: ${t.muted}; padding: 0.15rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid ${t.border}; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: ${t.muted}; }
  blockquote { border-left: 3px solid ${t.border}; margin-left: 0; padding-left: 1rem; color: ${t.mutedFg}; }
  img { max-width: 100%; }
  a { color: ${t.link}; }
  hr { border: none; border-top: 1px solid ${t.border}; margin: 1.5rem 0; }
  @media print { body { margin: 0; background: white; color: #1a1a1a; } }
</style>
</head>
<body>${body}</body>
</html>`;
};

export function MarkdownPreviewTool() {
  const { download } = useDownload();
  const { resolvedTheme } = useTheme();
  const exportTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
  const [input, setInput] = useState(DEFAULT_MD);
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!input) {
      setHtml('');
      return;
    }
    let cancelled = false;
    import('marked').then(({ marked }) => {
      if (cancelled) return;
      try {
        setHtml(marked.parse(input, { async: false }) as string);
      } catch {
        setHtml('<p class="text-destructive">Parse error</p>');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  const previewSrcdoc = useMemo(() => {
    if (!html) return '';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
      :root { color-scheme: ${exportTheme}; }
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 1rem; margin: 0; color: ${THEME_VARS[exportTheme].fg}; background: ${THEME_VARS[exportTheme].bg}; }
      pre { background: ${THEME_VARS[exportTheme].muted}; padding: 1rem; border-radius: 6px; overflow-x: auto; }
      code { background: ${THEME_VARS[exportTheme].muted}; padding: 0.15rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
      pre code { background: none; padding: 0; }
      table { border-collapse: collapse; width: 100%; font-size: 0.875rem; }
      th, td { border: 1px solid ${THEME_VARS[exportTheme].border}; padding: 0.5rem 0.75rem; text-align: left; }
      th { background: ${THEME_VARS[exportTheme].muted}; }
      blockquote { border-left: 3px solid ${THEME_VARS[exportTheme].border}; margin-left: 0; padding-left: 1rem; color: ${THEME_VARS[exportTheme].mutedFg}; }
      img { max-width: 100%; }
      a { color: ${THEME_VARS[exportTheme].link}; }
      hr { border: none; border-top: 1px solid ${THEME_VARS[exportTheme].border}; margin: 1.5rem 0; }
    </style></head><body>${html}</body></html>`;
  }, [html, exportTheme]);

  const handleExportHtml = useCallback(() => {
    const fullHtml = HTML_TEMPLATE(html, exportTheme);
    const blob = new Blob([fullHtml], { type: 'text/html' });
    download(blob, 'markdown-export.html');
    toast.success('Exported HTML');
  }, [html, download, exportTheme]);

  const handleExportPdf = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(HTML_TEMPLATE(html, exportTheme));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }, [html, exportTheme]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <CopyButton value={html} size="sm" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportHtml}
          disabled={!input}
        >
          <Download className="mr-2 h-3.5 w-3.5" />
          Export HTML
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPdf}
          disabled={!html}
        >
          <FileText className="mr-2 h-3.5 w-3.5" />
          Export PDF
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setInput('')}>
          Clear
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Markdown
          </p>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write Markdown here..."
            rows={24}
            className="min-h-[500px] resize-y font-mono text-sm"
            autoFocus
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Preview
          </p>
          <iframe
            srcDoc={previewSrcdoc}
            sandbox="allow-same-origin"
            title="Markdown preview"
            className="min-h-[500px] w-full rounded-md border border-border"
          />
        </div>
      </div>
    </div>
  );
}
