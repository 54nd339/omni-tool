'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs';
import { useDownload } from '@/hooks';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const EC_LEVELS: { id: ErrorCorrectionLevel; label: string; hint: string }[] = [
  { id: 'L', label: 'L', hint: '~7% recovery' },
  { id: 'M', label: 'M', hint: '~15% recovery' },
  { id: 'Q', label: 'Q', hint: '~25% recovery' },
  { id: 'H', label: 'H', hint: '~30% recovery' },
];

export function QrGeneratorTool() {
  const { download } = useDownload();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [params, setParams] = useQueryStates({
    text: parseAsString.withDefault('https://example.com'),
    size: parseAsInteger.withDefault(300),
    fg: parseAsString.withDefault('#000000'),
    bg: parseAsString.withDefault('#ffffff'),
    ec: parseAsString.withDefault('M') as any, // Cast for simplicity with ErrorCorrectionLevel
  }, { shallow: true });

  const { text, size, fg: fgColor, bg: bgColor, ec: ecLevel } = params;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!text) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    import('qrcode').then((QRCode) => {
      QRCode.default
        .toCanvas(canvas, text, {
          width: size,
          margin: 2,
          errorCorrectionLevel: ecLevel as ErrorCorrectionLevel,
          color: { dark: fgColor, light: bgColor },
        })
        .catch((e) => {
          if (e instanceof Error) toast.error(e.message);
        });
    });
  }, [text, size, ecLevel, fgColor, bgColor]);

  const handleDownloadPng = useCallback(async () => {
    if (!text) return;
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: ecLevel as any,
        color: { dark: fgColor, light: bgColor },
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      download(blob, 'qr-code.png');
      toast.success('Downloaded PNG');
    } catch {
      toast.error('QR generation failed');
    }
  }, [text, size, ecLevel, fgColor, bgColor, download]);

  const handleDownloadSvg = useCallback(async () => {
    if (!text) return;
    try {
      const QRCode = (await import('qrcode')).default;
      const svg = await QRCode.toString(text, {
        type: 'svg',
        width: size,
        margin: 2,
        errorCorrectionLevel: ecLevel as any,
        color: { dark: fgColor, light: bgColor },
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      download(blob, 'qr-code.svg');
      toast.success('Downloaded SVG');
    } catch {
      toast.error('QR generation failed');
    }
  }, [text, size, ecLevel, fgColor, bgColor, download]);

  const handleCopySvg = useCallback(async () => {
    if (!text) return;
    try {
      const QRCode = (await import('qrcode')).default;
      const svg = await QRCode.toString(text, {
        type: 'svg',
        width: size,
        margin: 2,
        errorCorrectionLevel: ecLevel as any,
        color: { dark: fgColor, light: bgColor },
      });
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      toast.success('Copied SVG');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed');
    }
  }, [text, size, ecLevel, fgColor, bgColor]);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Content</p>
        <Textarea
          value={text}
          onChange={(e) => setParams({ text: e.target.value })}
          placeholder="Enter text or URL..."
          rows={3}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Error Correction
            </p>
            <ToggleGroup
              type="single"
              value={ecLevel}
              onValueChange={(v) => v && setParams({ ec: v as any })}
            >
              {EC_LEVELS.map((l) => (
                <ToggleGroupItem key={l.id} value={l.id} title={l.hint}>
                  {l.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Size: {size}px
            </p>
            <Slider
              min={100}
              max={1000}
              step={50}
              value={[size]}
              onValueChange={([v]) => setParams({ size: v })}
            />
          </div>

          <div className="flex gap-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Foreground
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setParams({ fg: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded border border-border"
                />
                <code className="text-xs">{fgColor}</code>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Background
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setParams({ bg: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded border border-border"
                />
                <code className="text-xs">{bgColor}</code>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadPng} disabled={!text}>
              <Download className="mr-2 h-4 w-4" />
              PNG
            </Button>
            <Button variant="outline" onClick={handleDownloadSvg} disabled={!text}>
              <Download className="mr-2 h-4 w-4" />
              SVG
            </Button>
            <Button variant="ghost" onClick={handleCopySvg} disabled={!text}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copy SVG
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-center">
          {text ? (
            <canvas
              ref={canvasRef}
              className="max-w-full rounded-lg border border-border"
            />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              Enter content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
