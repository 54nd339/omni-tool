'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useToolParams } from '@/hooks';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CopyButton } from '@/components/shared/copy-button';
import { SendToButton } from '@/components/shared/send-to-button';
import { FileDropzone } from '@/components/shared/file-dropzone';

type Tab = 'base64' | 'url' | 'html';
type EncodeDecodeMode = 'encode' | 'decode';

/* ---------- Base64 helpers ---------- */
function utf8ToBase64(str: string): string {
  return btoa(
    Array.from(new TextEncoder().encode(str), (b) => String.fromCharCode(b)).join(''),
  );
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* ---------- HTML Entity helpers ---------- */
const ENTITY_MAP: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
  "'": '&#39;', '\u00a0': '&nbsp;', '\u00a9': '&copy;', '\u00ae': '&reg;',
  '\u2122': '&trade;', '\u2013': '&ndash;', '\u2014': '&mdash;',
  '\u2018': '&lsquo;', '\u2019': '&rsquo;', '\u201c': '&ldquo;', '\u201d': '&rdquo;',
};

function encodeEntities(text: string, numeric: boolean): string {
  return text
    .replace(/[^\n\r\t\x20-\x7E]/g, (ch) => {
      if (!numeric && ENTITY_MAP[ch]) return ENTITY_MAP[ch];
      return `&#${ch.codePointAt(0) ?? 0};`;
    })
    .replace(/[&<>"']/g, (ch) => {
      if (!numeric && ENTITY_MAP[ch]) return ENTITY_MAP[ch];
      return `&#${ch.codePointAt(0) ?? 0};`;
    });
}

function decodeEntities(text: string): string {
  if (typeof document === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

const B64_DEFAULTS = { b64_text: '', b64_mode: 'encode' };

export function TextEncodersTool() {
  const searchParams = useSearchParams();
  const pasteParam = searchParams.get('paste');
  const initialPaste = pasteParam ? decodeURIComponent(pasteParam) : '';

  const [tab, setTab] = useState<Tab>('base64');
  const [params, setParams] = useToolParams(
    initialPaste ? { b64_text: initialPaste, b64_mode: 'decode' } : B64_DEFAULTS,
  );
  const b64Mode = (params.b64_mode === 'decode' ? 'decode' : 'encode') as EncodeDecodeMode;
  const [b64Input, setB64Input] = useState(params.b64_text);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (b64Input !== params.b64_text) {
        setParams({ b64_text: b64Input });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [b64Input, params.b64_text, setParams]);
  const [b64FileResult, setB64FileResult] = useState('');

  const [urlMode, setUrlMode] = useState<EncodeDecodeMode>('encode');
  const [urlInput, setUrlInput] = useState('');

  const [htmlMode, setHtmlMode] = useState<EncodeDecodeMode>('encode');
  const [htmlInput, setHtmlInput] = useState('');
  const [htmlNumeric, setHtmlNumeric] = useState(false);

  /* ---------- Base64 output ---------- */
  const b64Output = useMemo(() => {
    if (!b64Input) return '';
    try {
      return b64Mode === 'encode' ? utf8ToBase64(b64Input) : base64ToUtf8(b64Input);
    } catch {
      return '';
    }
  }, [b64Input, b64Mode]);

  const handleB64InputChange = useCallback(
    (value: string) => setB64Input(value),
    [],
  );

  const handleB64Files = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] ?? result;
      setB64FileResult(base64);
      toast.success(`${file.name} converted to Base64`);
    };
    reader.readAsDataURL(file);
  }, []);

  /* ---------- URL output ---------- */
  let urlOutput = '';
  try {
    urlOutput =
      urlMode === 'encode'
        ? encodeURIComponent(urlInput)
        : decodeURIComponent(urlInput);
  } catch {
    urlOutput = '(invalid input)';
  }

  /* ---------- HTML output ---------- */
  const htmlOutput = useMemo(() => {
    if (!htmlInput) return '';
    return htmlMode === 'encode'
      ? encodeEntities(htmlInput, htmlNumeric)
      : decodeEntities(htmlInput);
  }, [htmlInput, htmlMode, htmlNumeric]);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Encoder</p>
        <ToggleGroup
          type="single"
          value={tab}
          onValueChange={(v) => v && setTab(v as Tab)}
        >
          <ToggleGroupItem value="base64">Base64</ToggleGroupItem>
          <ToggleGroupItem value="url">URL Encode</ToggleGroupItem>
          <ToggleGroupItem value="html">HTML Entities</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* ---------- Base64 tab ---------- */}
      {tab === 'base64' && (
        <>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
            <ToggleGroup
              type="single"
              value={b64Mode}
              onValueChange={(v) => {
                if (v) {
                  setB64Input('');
                  setParams({ b64_mode: v, b64_text: '' });
                }
              }}
            >
              <ToggleGroupItem value="encode">Encode</ToggleGroupItem>
              <ToggleGroupItem value="decode">Decode</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {b64Mode === 'encode' ? 'Text' : 'Base64'}
              </p>
              <Textarea
                value={b64Input}
                onChange={(e) => handleB64InputChange(e.target.value)}
                placeholder={
                  b64Mode === 'encode'
                    ? 'Enter text to encode...'
                    : 'Paste Base64 to decode...'
                }
                rows={10}
                className="font-mono text-sm"
                autoFocus
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {b64Mode === 'encode' ? 'Base64' : 'Text'}
                </p>
              </div>
              <Textarea
                value={b64Output}
                readOnly
                rows={10}
                className="font-mono text-sm"
                placeholder="Result appears here..."
              />
            </div>
          </div>

          {b64Output && (
            <div className="flex items-center gap-3">
              <SendToButton value={b64Output} outputType="text" />
              <CopyButton value={b64Output} />
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              File to Base64
            </p>
            <FileDropzone
              onFiles={handleB64Files}
              label="Drop any file to convert to Base64"
              hint="Max 10 MB recommended"
              maxSize={10 * 1024 * 1024}
            />
            {b64FileResult && (
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    File Base64
                  </p>
                  <CopyButton value={b64FileResult} size="sm" />
                </div>
                <Textarea
                  value={b64FileResult}
                  readOnly
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ---------- URL Encode tab ---------- */}
      {tab === 'url' && (
        <>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
            <ToggleGroup
              type="single"
              value={urlMode}
              onValueChange={(v) => v && setUrlMode(v as EncodeDecodeMode)}
            >
              <ToggleGroupItem value="encode">Encode</ToggleGroupItem>
              <ToggleGroupItem value="decode">Decode</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Input</p>
              <Textarea
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                rows={10}
                className="font-mono text-sm"
                placeholder={
                  urlMode === 'encode'
                    ? 'Paste URL or text to encode...'
                    : 'Paste encoded string to decode...'
                }
                autoFocus
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {urlMode === 'encode' ? 'Encoded' : 'Decoded'}
                </p>
                {urlOutput && urlOutput !== '(invalid input)' && (
                  <CopyButton value={urlOutput} size="sm" />
                )}
              </div>
              <Textarea
                value={urlOutput}
                readOnly
                rows={10}
                className="font-mono text-sm"
                placeholder="Result appears here..."
              />
            </div>
          </div>
        </>
      )}

      {/* ---------- HTML Entities tab ---------- */}
      {tab === 'html' && (
        <>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
              <ToggleGroup
                type="single"
                value={htmlMode}
                onValueChange={(v) => v && setHtmlMode(v as EncodeDecodeMode)}
              >
                <ToggleGroupItem value="encode">Encode</ToggleGroupItem>
                <ToggleGroupItem value="decode">Decode</ToggleGroupItem>
              </ToggleGroup>
            </div>
            {htmlMode === 'encode' && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Format
                </p>
                <ToggleGroup
                  type="single"
                  value={htmlNumeric ? 'numeric' : 'named'}
                  onValueChange={(v) => v && setHtmlNumeric(v === 'numeric')}
                >
                  <ToggleGroupItem value="named">Named</ToggleGroupItem>
                  <ToggleGroupItem value="numeric">Numeric</ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Input
              </p>
              <Textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder={
                  htmlMode === 'encode'
                    ? '<p>Hello & "World"</p>'
                    : '&lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt;'
                }
                rows={10}
                className="font-mono text-sm"
                autoFocus
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Output</p>
                {htmlOutput && <CopyButton value={htmlOutput} size="sm" />}
              </div>
              <Textarea
                value={htmlOutput}
                readOnly
                rows={10}
                className="font-mono text-sm"
                placeholder="Result appears here..."
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
