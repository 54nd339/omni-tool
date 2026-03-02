'use client';

import { useCallback, useRef, lazy, Suspense, type CSSProperties } from 'react';
import { useTheme } from 'next-themes';
import { Textarea } from '@/components/ui/textarea';

const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((m) => ({ default: m.default })),
);

const LANGUAGE_MAP: Record<string, string> = {
  json: 'json',
  yaml: 'yaml',
  xml: 'xml',
  csv: 'plaintext',
  javascript: 'javascript',
  typescript: 'typescript',
  html: 'html',
  css: 'css',
  sql: 'sql',
  python: 'python',
  go: 'go',
  rust: 'rust',
  markdown: 'markdown',
};

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  placeholder?: string;
  height?: string | number;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'json',
  readOnly = false,
  placeholder,
  height = '24rem',
  className,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<unknown>(null);

  const handleEditorMount = useCallback((editor: unknown) => {
    editorRef.current = editor;
  }, []);

  const monacoLang = LANGUAGE_MAP[language] ?? 'plaintext';

  const style: CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: '12rem',
  };

  return (
    <div className={className} style={style}>
      <Suspense
        fallback={
          <Textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            readOnly={readOnly}
            placeholder={placeholder}
            className="h-full min-h-[12rem] resize-none font-mono text-sm"
          />
        }
      >
        <MonacoEditor
          height="100%"
          language={monacoLang}
          value={value}
          theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
          onChange={(v) => onChange?.(v ?? '')}
          onMount={handleEditorMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: 'on',
            folding: true,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            renderWhitespace: 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            padding: { top: 8, bottom: 8 },
          }}
        />
      </Suspense>
    </div>
  );
}
