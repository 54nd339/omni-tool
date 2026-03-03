'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToolParams } from '@/hooks/use-tool-params';
import {
  buildMarkdownHtmlDocument,
  buildMarkdownPreviewSrcdoc,
  DEFAULT_MARKDOWN,
  openPrintWindow,
  parseMarkdownToHtml,
} from '@/lib/dev-utils/markdown-preview';
import { downloadBlob } from '@/lib/utils';

export function MarkdownPreviewTool() {
  const searchParams = useSearchParams();
  const download = downloadBlob;
  const { resolvedTheme } = useTheme();
  const exportTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
  const initialInput = useMemo(() => {
    const inputParam = searchParams.get('input');
    if (inputParam !== null) return inputParam;
    const pasteParam = searchParams.get('paste');
    return pasteParam ? decodeURIComponent(pasteParam) : DEFAULT_MARKDOWN;
  }, [searchParams]);
  const defaults = useMemo(() => ({ input: initialInput }), [initialInput]);
  const [params, setParams] = useToolParams(defaults);
  const input = params.input;
  const [html, setHtml] = useState('');

  useEffect(() => {
    let cancelled = false;

    parseMarkdownToHtml(input).then((parsedHtml) => {
      if (cancelled) return;
      setHtml(parsedHtml);
    });

    return () => {
      cancelled = true;
    };
  }, [input]);

  const previewSrcdoc = useMemo(() => {
    return buildMarkdownPreviewSrcdoc(html, exportTheme);
  }, [html, exportTheme]);

  const handleExportHtml = useCallback(() => {
    const fullHtml = buildMarkdownHtmlDocument(html, exportTheme);
    const blob = new Blob([fullHtml], { type: 'text/html' });
    download(blob, 'markdown-export.html');
    toast.success('Exported HTML');
  }, [html, download, exportTheme]);

  const handleExportPdf = useCallback(() => {
    const success = openPrintWindow(buildMarkdownHtmlDocument(html, exportTheme));
    if (!success) {
      toast.error('Popup blocked. Allow popups to export PDF.');
    }
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
        <Button variant="ghost" size="sm" onClick={() => setParams({ input: '' })}>
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
            onChange={(event) => setParams({ input: event.target.value })}
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
