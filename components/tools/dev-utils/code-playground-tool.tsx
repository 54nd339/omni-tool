'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CopyButton } from '@/components/shared/copy-button';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((m) => m.default), { ssr: false });

type Language = 'javascript' | 'typescript' | 'python';

const EXAMPLES: Record<Language, string> = {
  javascript: `// Fibonacci sequence
function fibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

console.log(fibonacci(15));
console.log("Sum:", fibonacci(15).reduce((a, b) => a + b, 0));`,
  typescript: `// Generic stack implementation
interface Stack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  size: number;
}

function createStack<T>(): Stack<T> {
  const items: T[] = [];
  return {
    push: (item: T) => items.push(item),
    pop: () => items.pop(),
    peek: () => items[items.length - 1],
    get size() { return items.length; },
  };
}

const stack = createStack<number>();
[10, 20, 30].forEach(n => stack.push(n));
console.log("Size:", stack.size);
console.log("Peek:", stack.peek());
console.log("Pop:", stack.pop());
console.log("Size after pop:", stack.size);`,
  python: `# FizzBuzz
for i in range(1, 31):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)`,
};

interface ConsoleEntry {
  type: 'log' | 'error' | 'warn' | 'info';
  args: string;
  ts: number;
}

export function CodePlaygroundTool() {
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState(EXAMPLES.javascript);
  const [output, setOutput] = useState<ConsoleEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const pyodideRef = useRef<unknown>(null);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(EXAMPLES[lang]);
    setOutput([]);
    setExecTime(null);
  };

  const runJavaScript = useCallback((src: string) => {
    const logs: ConsoleEntry[] = [];
    const capture = (type: ConsoleEntry['type']) => (...args: unknown[]) => {
      logs.push({ type, args: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '), ts: Date.now() });
    };

    const sandbox = {
      console: { log: capture('log'), error: capture('error'), warn: capture('warn'), info: capture('info') },
      setTimeout: undefined, setInterval: undefined, fetch: undefined,
    };

    const start = performance.now();
    try {
      const fn = new Function(...Object.keys(sandbox), src);
      fn(...Object.values(sandbox));
    } catch (e) {
      logs.push({ type: 'error', args: e instanceof Error ? `${e.name}: ${e.message}` : String(e), ts: Date.now() });
    }
    const elapsed = performance.now() - start;
    return { logs, elapsed };
  }, []);

  const runPython = useCallback(async (src: string) => {
    const logs: ConsoleEntry[] = [];
    const start = performance.now();
    try {
      if (!pyodideRef.current) {
        logs.push({ type: 'info', args: 'Loading Python runtime (first run may take a few seconds)...', ts: Date.now() });
        setOutput([...logs]);

        // Load Pyodide from CDN at runtime (can't use import() with https: URLs in webpack)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Pyodide'));
            document.head.appendChild(script);
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pyodideRef.current = await (window as any).loadPyodide();
      }
      const pyodide = pyodideRef.current as { runPython: (code: string) => unknown; runPythonAsync: (code: string) => Promise<unknown> };

      pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);
      await pyodide.runPythonAsync(src);
      const stdout = pyodide.runPython('sys.stdout.getvalue()') as string;
      const stderr = pyodide.runPython('sys.stderr.getvalue()') as string;

      if (stdout) logs.push({ type: 'log', args: stdout.trimEnd(), ts: Date.now() });
      if (stderr) logs.push({ type: 'error', args: stderr.trimEnd(), ts: Date.now() });
    } catch (e) {
      logs.push({ type: 'error', args: e instanceof Error ? e.message : String(e), ts: Date.now() });
    }
    const elapsed = performance.now() - start;
    return { logs, elapsed };
  }, []);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput([]);
    setExecTime(null);

    let result: { logs: ConsoleEntry[]; elapsed: number };
    if (language === 'python') {
      result = await runPython(code);
    } else {
      let src = code;
      if (language === 'typescript') {
        try {
          const { transform } = await import('sucrase');
          src = transform(code, { transforms: ['typescript'] }).code;
        } catch (err) {
          toast.error('Failed to compile TypeScript');
          setRunning(false);
          return;
        }
      }
      result = runJavaScript(src);
    }

    setOutput(result.logs);
    setExecTime(result.elapsed);
    setRunning(false);
    if (result.logs.every((l) => l.type !== 'error')) toast.success(`Executed in ${result.elapsed.toFixed(1)}ms`);
  }, [code, language, runJavaScript, runPython]);

  const outputText = output.map((e) => e.args).join('\n');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ToggleGroup type="single" value={language} onValueChange={(v) => v && handleLanguageChange(v as Language)}>
          <ToggleGroupItem value="javascript">JavaScript</ToggleGroupItem>
          <ToggleGroupItem value="typescript">TypeScript</ToggleGroupItem>
          <ToggleGroupItem value="python">Python</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-3">
          {execTime !== null && (
            <span className="text-xs text-muted-foreground">{execTime.toFixed(1)}ms</span>
          )}
          <Button onClick={handleRun} disabled={running}>
            {running ? 'Running...' : 'Run (Ctrl+Enter)'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex h-8 items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Code</p>
          </div>
          <div className="overflow-hidden rounded-md border border-border">
            <MonacoEditor
              height="450px"
              language={language}
              value={code}
              onChange={(v) => setCode(v ?? '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                tabSize: 2,
                automaticLayout: true,
                padding: { top: 12 },
              }}
              onMount={(editor) => {
                editor.addCommand(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (window as any).monaco?.KeyMod.CtrlCmd | (window as any).monaco?.KeyCode.Enter,
                  () => handleRun(),
                );
              }}
            />
          </div>
        </div>
        <div>
          <div className="mb-2 flex h-8 items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Console Output</p>
            {outputText && <CopyButton value={outputText} size="sm" />}
          </div>
          <div className="h-[450px] overflow-auto rounded-md border border-border bg-muted p-4 font-mono text-sm">
            {output.length === 0 ? (
              <p className="text-muted-foreground">Output will appear here...</p>
            ) : (
              output.map((entry, i) => (
                <pre
                  key={i}
                  className={
                    entry.type === 'error' ? 'text-red-400' :
                      entry.type === 'warn' ? 'text-yellow-400' :
                        entry.type === 'info' ? 'text-blue-400' :
                          'text-foreground'
                  }
                >
                  {entry.args}
                </pre>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
