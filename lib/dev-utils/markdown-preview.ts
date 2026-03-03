export type MarkdownTheme = 'light' | 'dark';

export const DEFAULT_MARKDOWN = `# Markdown Editor

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
    bg: '#ffffff',
    border: '#e4e4e7',
    fg: '#1a1a1a',
    link: '#2563eb',
    muted: '#f4f4f5',
    mutedFg: '#52525b',
  },
  dark: {
    bg: '#09090b',
    border: '#3f3f46',
    fg: '#fafafa',
    link: '#60a5fa',
    muted: '#27272a',
    mutedFg: '#a1a1aa',
  },
} as const;

export async function parseMarkdownToHtml(input: string): Promise<string> {
  if (!input) {
    return '';
  }

  try {
    const { marked } = await import('marked');
    return marked.parse(input, { async: false }) as string;
  } catch {
    return '<p class="text-destructive">Parse error</p>';
  }
}

export function buildMarkdownHtmlDocument(body: string, theme: MarkdownTheme): string {
  const vars = THEME_VARS[theme];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: ${vars.fg}; background: ${vars.bg}; }
  pre { background: ${vars.muted}; padding: 1rem; border-radius: 6px; overflow-x: auto; }
  code { background: ${vars.muted}; padding: 0.15rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid ${vars.border}; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: ${vars.muted}; }
  blockquote { border-left: 3px solid ${vars.border}; margin-left: 0; padding-left: 1rem; color: ${vars.mutedFg}; }
  img { max-width: 100%; }
  a { color: ${vars.link}; }
  hr { border: none; border-top: 1px solid ${vars.border}; margin: 1.5rem 0; }
  @media print { body { margin: 0; background: white; color: #1a1a1a; } }
</style>
</head>
<body>${body}</body>
</html>`;
}

export function buildMarkdownPreviewSrcdoc(body: string, theme: MarkdownTheme): string {
  if (!body) {
    return '';
  }

  const vars = THEME_VARS[theme];

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    :root { color-scheme: ${theme}; }
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 1rem; margin: 0; color: ${vars.fg}; background: ${vars.bg}; }
    pre { background: ${vars.muted}; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    code { background: ${vars.muted}; padding: 0.15rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; font-size: 0.875rem; }
    th, td { border: 1px solid ${vars.border}; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: ${vars.muted}; }
    blockquote { border-left: 3px solid ${vars.border}; margin-left: 0; padding-left: 1rem; color: ${vars.mutedFg}; }
    img { max-width: 100%; }
    a { color: ${vars.link}; }
    hr { border: none; border-top: 1px solid ${vars.border}; margin: 1.5rem 0; }
  </style></head><body>${body}</body></html>`;
}

export function openPrintWindow(documentHtml: string): boolean {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    return false;
  }

  printWindow.document.write(documentHtml);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
  return true;
}
