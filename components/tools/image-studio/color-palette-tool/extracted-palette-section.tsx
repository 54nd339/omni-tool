'use client';

import Image from 'next/image';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  type ColorInfo,
  type ExportFormat,
  formatPaletteExport,
} from '@/lib/image/color-palette';
import { cn } from '@/lib/utils';

interface ExtractedPaletteSectionProps {
  colors: ColorInfo[];
  exportFormat: ExportFormat;
  file: File;
  imageUrl: string;
  loading: boolean;
  onExportFormatChange: (format: ExportFormat) => void;
  onReset: () => void;
}

export function ExtractedPaletteSection({
  colors,
  exportFormat,
  file,
  imageUrl,
  loading,
  onExportFormatChange,
  onReset,
}: ExtractedPaletteSectionProps) {
  const exportText = formatPaletteExport(colors, exportFormat);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
            <Image src={imageUrl} alt="Uploaded" width={64} height={64} unoptimized className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Extracting colors…' : `${colors.length} dominant colors`}
            </p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={onReset}>
              New image
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-24 rounded-md bg-muted" />
                <div className="mt-2 h-4 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : colors.length > 0 ? (
        <>
          <div>
            <p className="mb-3 text-sm font-medium">Color swatches</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {colors.map((color, index) => (
                <Card key={`${color.hex}-${index}`}>
                  <CardContent className="space-y-3 p-4">
                    <div
                      className={cn(
                        'h-24 w-full rounded-md border border-border',
                        'ring-offset-background focus-visible:ring-2 focus-visible:ring-ring',
                      )}
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="space-y-1 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">HEX</span>
                        <span className="flex-1 truncate">{color.hex}</span>
                        <CopyButton value={color.hex} size="sm" toolId="color-palette" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-muted-foreground">RGB</span>
                        <span className="flex-1 truncate">
                          rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                        </span>
                        <CopyButton
                          value={`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`}
                          size="sm"
                          toolId="color-palette"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-muted-foreground">HSL</span>
                        <span className="flex-1 truncate">
                          hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
                        </span>
                        <CopyButton
                          value={`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`}
                          size="sm"
                          toolId="color-palette"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Export palette</p>
            <ToggleGroup
              type="single"
              value={exportFormat}
              onValueChange={(value) => value && onExportFormatChange(value as ExportFormat)}
            >
              <ToggleGroupItem value="json">JSON</ToggleGroupItem>
              <ToggleGroupItem value="css">CSS Vars</ToggleGroupItem>
              <ToggleGroupItem value="tailwind">Tailwind</ToggleGroupItem>
              <ToggleGroupItem value="scss">SCSS</ToggleGroupItem>
            </ToggleGroup>
            <div className="flex gap-2">
              <Textarea readOnly value={exportText} className="min-h-[120px] flex-1 font-mono text-xs" />
              <CopyButton value={exportText} toolId="color-palette" className="shrink-0" />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
