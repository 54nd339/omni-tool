'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared/copy-button';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((m) => m.default), { ssr: false });

interface QueryResult {
  columns: string[];
  values: unknown[][];
}

interface TableInfo {
  name: string;
  columns: { name: string; type: string }[];
}

const HISTORY_KEY = 'db-query-history';
const MAX_HISTORY = 20;

interface HistoryEntry {
  sql: string;
  time: number;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

const SAMPLE_SQL = `-- Create sample tables
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Insert sample data
INSERT OR IGNORE INTO users (id, name, email) VALUES
  (1, 'Alice', 'alice@example.com'),
  (2, 'Bob', 'bob@example.com'),
  (3, 'Charlie', 'charlie@example.com');

INSERT OR IGNORE INTO posts (id, user_id, title, content) VALUES
  (1, 1, 'Getting Started', 'Hello world!'),
  (2, 1, 'Advanced SQL', 'Joins and subqueries...'),
  (3, 2, 'My First Post', 'Excited to be here!');

-- Query
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id
ORDER BY post_count DESC;`;

export function DbPlaygroundTool() {
  const [sql, setSql] = useState(SAMPLE_SQL);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [running, setRunning] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbRef = useRef<any>(null);
  const initRef = useRef(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const initDb = useCallback(async () => {
    if (dbRef.current) return dbRef.current;
    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://unpkg.com/sql.js@1.14.0/dist/${file}`,
    });
    dbRef.current = new SQL.Database();
    return dbRef.current;
  }, []);

  const refreshSchema = useCallback(async () => {
    try {
      const db = await initDb();
      const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
      if (res.length === 0) { setTables([]); return; }
      const tableNames = res[0].values.map((r: unknown[]) => String(r[0]));
      const tableInfos: TableInfo[] = [];
      for (const name of tableNames) {
        const info = db.exec(`PRAGMA table_info("${name}")`);
        const columns = info.length > 0
          ? info[0].values.map((r: unknown[]) => ({ name: String(r[1]), type: String(r[2]) }))
          : [];
        tableInfos.push({ name, columns });
      }
      setTables(tableInfos);
    } catch {
      /* ignore schema errors */
    }
  }, [initDb]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    initDb().then(() => refreshSchema());
  }, [initDb, refreshSchema]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResults([]);
    setExecTime(null);

    try {
      const db = await initDb();
      const start = performance.now();
      const res = db.exec(sql);
      const elapsed = performance.now() - start;

      setResults(res.map((r: { columns: string[]; values: unknown[][] }) => ({
        columns: r.columns,
        values: r.values,
      })));
      setExecTime(elapsed);
      await refreshSchema();
      toast.success(`Executed in ${elapsed.toFixed(1)}ms`);

      const trimmed = sql.trim();
      if (trimmed) {
        const entry: HistoryEntry = { sql: trimmed, time: Date.now() };
        const updated = [entry, ...loadHistory().filter((h) => h.sql !== trimmed)].slice(0, MAX_HISTORY);
        saveHistory(updated);
        setHistory(updated);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'SQL error');
    } finally {
      setRunning(false);
    }
  }, [sql, initDb, refreshSchema]);

  const handleReset = useCallback(async () => {
    try {
      if (dbRef.current) dbRef.current.close();
      dbRef.current = null;
      const db = await initDb();
      dbRef.current = db;
      setResults([]);
      setError(null);
      setTables([]);
      await refreshSchema();
      toast.success('Database reset');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Reset failed');
    }
  }, [initDb, refreshSchema]);

  const handleExportSql = useCallback(async () => {
    try {
      const db = await initDb();
      const data = db.export();
      const blob = new Blob([data], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'database.sqlite';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Database exported');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    }
  }, [initDb]);

  const resultsCsv = results.length > 0
    ? results.map((r) => [r.columns?.join(',') ?? '', ...(r.values || []).map((row) => row.map((v) => JSON.stringify(v ?? '')).join(','))].join('\n')).join('\n\n')
    : '';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>Reset DB</Button>
          <Button variant="outline" size="sm" onClick={handleExportSql}>Export .sqlite</Button>
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen((o) => !o)}>
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            History{history.length > 0 && ` (${history.length})`}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {execTime !== null && (
            <span className="text-xs text-muted-foreground">{execTime.toFixed(1)}ms</span>
          )}
          <Button onClick={handleRun} disabled={running}>
            {running ? 'Running...' : 'Run (Ctrl+Enter)'}
          </Button>
        </div>
      </div>

      {historyOpen && (
        <div className="rounded-md border border-border bg-muted/20 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Query History</p>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-destructive"
                onClick={() => {
                  localStorage.removeItem(HISTORY_KEY);
                  setHistory([]);
                }}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">No queries yet</p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {history.map((entry, i) => (
                <li key={i}>
                  <button
                    className="w-full rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                    onClick={() => { setSql(entry.sql); setHistoryOpen(false); }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <code className="line-clamp-1 font-mono text-foreground">{entry.sql}</code>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {new Date(entry.time).toLocaleTimeString()}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">SQL</p>
            <div className="overflow-hidden rounded-md border border-border">
              <MonacoEditor
                height="300px"
                language="sql"
                value={sql}
                onChange={(v) => setSql(v ?? '')}
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
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Results{results.length > 0 && ` (${results.reduce((s, r) => s + r.values.length, 0)} rows)`}
              </p>
              {resultsCsv && <CopyButton value={resultsCsv} size="sm" />}
            </div>
            {error ? (
              <div className="rounded-md border border-destructive bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-[400px] overflow-auto rounded-md border border-border">
                {results.map((result, ri) => (
                  <table key={ri} className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        {result.columns?.map((col) => (
                          <th key={col} className="border-b border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(result.values || []).map((row, i) => (
                        <tr key={i} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                          {row.map((val, j) => (
                            <td key={j} className="px-3 py-1.5 font-mono text-xs">
                              {val === null ? <span className="text-muted-foreground italic">NULL</span> : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ))}
              </div>
            ) : (
              <div className="flex h-[100px] items-center justify-center rounded-md border border-border bg-muted/30">
                <p className="text-sm text-muted-foreground">Run a query to see results</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Schema</p>
          <div className="space-y-3 rounded-md border border-border p-3">
            {tables.length === 0 ? (
              <p className="text-xs text-muted-foreground">No tables yet</p>
            ) : (
              tables.map((table) => (
                <div key={table.name}>
                  <p className="text-xs font-semibold text-foreground">{table.name}</p>
                  <ul className="mt-1 space-y-0.5">
                    {table.columns.map((col) => (
                      <li key={col.name} className="text-xs text-muted-foreground">
                        <span className="font-mono">{col.name}</span>{' '}
                        <span className="text-xs opacity-60">{col.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
