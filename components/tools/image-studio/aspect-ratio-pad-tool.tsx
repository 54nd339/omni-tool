'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useClipboardPaste, useDownload } from '@/hooks';
import { Ratio as RatioIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { ShareButton } from '@/components/shared/share-button';
import { CopyButton } from '@/components/shared/copy-button';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { BeforeAfterSlider } from '@/components/shared/before-after-slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ColorPicker } from '@/components/ui/color-picker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ASPECT_RATIOS } from '@/lib/constants/aspect-ratios';
import { PAD_COLORS } from '@/lib/constants/pad-colors';
import { computePadDimensions } from '@/lib/image';
import { cn } from '@/lib/utils';
import type { AspectRatio } from '@/types';

const CALC_PRESETS = [
  { label: '16:9', w: 16, h: 9, ratioId: '16:9' as const },
  { label: '4:3', w: 4, h: 3, ratioId: null },
  { label: '3:2', w: 3, h: 2, ratioId: '3:2' as const },
  { label: '1:1', w: 1, h: 1, ratioId: '1:1' as const },
  { label: '9:16', w: 9, h: 16, ratioId: '9:16' as const },
  { label: '4:5', w: 4, h: 5, ratioId: '4:5' as const },
];

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

const RatioButton = memo(function RatioButton({
  ratio,
  selected,
  onSelect,
}: {
  ratio: AspectRatio;
  selected: boolean;
  onSelect: (r: AspectRatio) => void;
}) {
  return (
    <button
      onClick={() => onSelect(ratio)}
      className={cn(
        'rounded-md border px-3 py-2 text-left text-xs transition-colors',
        selected
          ? 'border-foreground bg-muted font-medium'
          : 'border-border hover:bg-muted/50',
      )}
    >
      <div className="font-medium">{ratio.label}</div>
      <div className="text-muted-foreground">{ratio.hint}</div>
    </button>
  );
});

export function AspectRatioPadTool() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { download } = useDownload();

  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(ASPECT_RATIOS[0]);
  const [colorMode, setColorMode] = useState('white');
  const [customColor, setCustomColor] = useState('#000000');
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const [calcExpanded, setCalcExpanded] = useState(false);
  const [calcWidth, setCalcWidth] = useState('1920');
  const [calcHeight, setCalcHeight] = useState('1080');

  const w = parseFloat(calcWidth);
  const h = parseFloat(calcHeight);
  const calcRatio = useMemo(() => {
    if (!w || !h || isNaN(w) || isNaN(h)) return null;
    const g = gcd(w, h);
    return { w: w / g, h: h / g, decimal: (w / h).toFixed(4) };
  }, [w, h]);

  const handleCalcPreset = useCallback(
    (pw: number, ph: number, ratioId: string | null) => {
      const currentW = parseFloat(calcWidth);
      if (currentW && !isNaN(currentW)) {
        setCalcHeight(String(Math.round(currentW * (ph / pw))));
      } else {
        setCalcWidth(String(pw * 100));
        setCalcHeight(String(ph * 100));
      }
      if (ratioId) {
        const match = ASPECT_RATIOS.find((r) => r.id === ratioId);
        if (match) setSelectedRatio(match);
      }
    },
    [calcWidth],
  );

  const handleCalcWidthChange = useCallback(
    (newW: string) => {
      setCalcWidth(newW);
      if (calcRatio && parseFloat(newW)) {
        setCalcHeight(String(Math.round(parseFloat(newW) * (calcRatio.h / calcRatio.w))));
      }
    },
    [calcRatio],
  );

  const handleCalcHeightChange = useCallback(
    (newH: string) => {
      setCalcHeight(newH);
      if (calcRatio && parseFloat(newH)) {
        setCalcWidth(String(Math.round(parseFloat(newH) * (calcRatio.w / calcRatio.h))));
      }
    },
    [calcRatio],
  );

  const calcResultText = calcRatio ? `${calcRatio.w}:${calcRatio.h}` : '';

  const [inputUrl, setInputUrl] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setResultBlob(null);

    const url = URL.createObjectURL(f);
    setInputUrl(url);
    const img = new Image();
    img.onload = () => setImgDimensions({ width: img.width, height: img.height });
    img.src = url;
  }, []);

  useClipboardPaste(handleFiles, !file);

  const fillColor =
    colorMode === 'custom'
      ? customColor
      : PAD_COLORS.find((c): c is typeof c & { value: string } => c.id === colorMode && 'value' in c)?.value ?? '#ffffff';

  const padDims =
    imgDimensions.width > 0
      ? computePadDimensions(imgDimensions.width, imgDimensions.height, selectedRatio)
      : null;

  const handlePad = useCallback(async () => {
    if (!file || !padDims) return;
    setIsProcessing(true);

    try {
      const img = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = padDims.targetWidth;
      canvas.height = padDims.targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');

      if (fillColor !== 'transparent') {
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const sw = Math.round(img.width * scale);
      const sh = Math.round(img.height * scale);
      const x = Math.round((canvas.width - sw) / 2);
      const y = Math.round((canvas.height - sh) / 2);

      ctx.drawImage(img, x, y, sw, sh);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Canvas export failed'));
          },
          'image/png'
        );
      });

      setResultUrl(URL.createObjectURL(blob));
      setResultBlob(blob);
      toast.success('Image padded');
    } catch {
      toast.error('Padding failed');
    } finally {
      setIsProcessing(false);
    }
  }, [file, padDims, fillColor]);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-border">
        <button
          type="button"
          onClick={() => setCalcExpanded((e) => !e)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50"
        >
          <span>Aspect Ratio Calculator</span>
          {calcExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {calcExpanded && (
          <div className="space-y-4 border-t border-border px-4 py-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Presets</p>
              <div className="flex flex-wrap gap-2">
                {CALC_PRESETS.map((p) => (
                  <Button
                    key={p.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCalcPreset(p.w, p.h, p.ratioId)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Width</p>
                <Input
                  value={calcWidth}
                  onChange={(e) => setCalcWidth(e.target.value)}
                  type="number"
                  className="font-mono"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Height</p>
                <Input
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(e.target.value)}
                  type="number"
                  className="font-mono"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Ratio</p>
                <div className="flex items-center gap-2">
                  <Input value={calcResultText} readOnly className="font-mono" />
                  {calcResultText && <CopyButton value={calcResultText} />}
                </div>
              </div>
            </div>
            {calcRatio && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {calcWidth} × {calcHeight} = <strong>{calcRatio.w}:{calcRatio.h}</strong> ({calcRatio.decimal})
                </p>
                <div
                  className="rounded-md border-2 border-foreground/20"
                  style={{
                    width: Math.min(300, (w / Math.max(w, h)) * 300),
                    height: Math.min(300, (h / Math.max(w, h)) * 300),
                    minWidth: 40,
                    minHeight: 40,
                  }}
                />
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Scale to width</p>
                  <div className="flex gap-2">
                    {[640, 1280, 1920, 2560, 3840].map((tw) => (
                      <Button
                        key={tw}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCalcWidthChange(String(tw))}
                      >
                        {tw}px
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Scale to height</p>
                  <div className="flex gap-2">
                    {[360, 480, 720, 1080, 2160].map((th) => (
                      <Button
                        key={th}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCalcHeightChange(String(th))}
                      >
                        {th}px
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!file && (
        <EmptyState icon={RatioIcon} title="Pad to aspect ratio" description="Upload an image to pad it to your chosen ratio" hint="Tip: ⌘V to paste an image from clipboard">
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            label="Drop an image to pad"
            hint="PNG, JPG, or WebP -- or paste from clipboard"
          />
        </EmptyState>
      )}

      {file && (
        <>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Aspect Ratio
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((r) => (
                  <RatioButton
                    key={r.id}
                    ratio={r}
                    selected={selectedRatio.id === r.id}
                    onSelect={setSelectedRatio}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Fill Color
              </p>
              <div className="flex items-center gap-3">
                <ToggleGroup
                  type="single"
                  value={colorMode}
                  onValueChange={(v) => v && setColorMode(v)}
                >
                  {PAD_COLORS.map((c) => (
                    <ToggleGroupItem key={c.id} value={c.id}>
                      {c.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                {colorMode === 'custom' && (
                  <ColorPicker value={customColor} onChange={setCustomColor} />
                )}
              </div>
            </div>

            {padDims && (
              <p className="text-xs text-muted-foreground">
                Output: {padDims.targetWidth}×{padDims.targetHeight}px
              </p>
            )}
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Padding image...</p>
              <Progress value={100} className="animate-pulse" />
            </div>
          )}

          {(resultUrl || inputUrl) && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
              {resultUrl && inputUrl ? (
                <div className="overflow-hidden rounded-lg bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3C%2Fsvg%3E')]">
                  <BeforeAfterSlider
                    beforeSrc={inputUrl}
                    afterSrc={resultUrl}
                    beforeLabel="Original"
                    afterLabel="Padded"
                    className="max-h-[400px] w-full"
                  />
                </div>
              ) : inputUrl ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <img src={inputUrl} alt="Original" className="max-h-[400px] w-full object-contain" />
                </div>
              ) : null}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handlePad} disabled={isProcessing} loading={isProcessing}>
              {resultBlob ? 'Re-pad' : 'Pad Image'}
            </Button>
            {resultBlob && (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    download(resultBlob, `${file.name.replace(/\.[^.]+$/, '')}-padded.png`)
                  }
                >
                  Download
                </Button>
                <ShareButton blob={resultBlob} fileName={`${file.name.replace(/\.[^.]+$/, '')}-padded.png`} />
              </>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                setFile(null);
                setResultUrl(null);
                setResultBlob(null);
                setInputUrl(null);
              }}
            >
              New image
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
