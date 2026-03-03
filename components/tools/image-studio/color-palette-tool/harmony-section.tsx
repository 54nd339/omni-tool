'use client';

import { Palette } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { generateHarmony, type HarmonyType } from '@/lib/image/color-palette';

interface HarmonySectionProps {
  baseHex: string;
  harmony: HarmonyType;
  onBaseHexChange: (hex: string) => void;
  onHarmonyChange: (harmony: HarmonyType) => void;
}

export function HarmonySection({
  baseHex,
  harmony,
  onBaseHexChange,
  onHarmonyChange,
}: HarmonySectionProps) {
  const harmonyColors = generateHarmony(baseHex, harmony);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Harmonious Palettes</h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Base Color</p>
            <div className="flex gap-2">
              <input
                type="color"
                value={baseHex}
                onChange={(event) => onBaseHexChange(event.target.value)}
                className="h-10 w-20 cursor-pointer rounded border border-border bg-transparent"
              />
              <input
                type="text"
                value={baseHex}
                onChange={(event) => {
                  const value = event.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) onBaseHexChange(value);
                }}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Harmony Type</p>
            <ToggleGroup
              type="single"
              value={harmony}
              onValueChange={(value) => value && onHarmonyChange(value as HarmonyType)}
              className="justify-start"
            >
              <ToggleGroupItem value="complementary">Complementary</ToggleGroupItem>
              <ToggleGroupItem value="analogous">Analogous</ToggleGroupItem>
              <ToggleGroupItem value="triadic">Triadic</ToggleGroupItem>
              <ToggleGroupItem value="split">Split</ToggleGroupItem>
              <ToggleGroupItem value="tetradic">Tetradic</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Result</p>
          <div className="flex gap-2">
            {harmonyColors.map((color, index) => (
              <div
                key={`${color}-${index}`}
                className="group relative flex-1 cursor-pointer"
                onClick={() => onBaseHexChange(color)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') onBaseHexChange(color);
                }}
              >
                <div
                  className="h-20 rounded-md border border-border transition-transform group-hover:scale-[1.03]"
                  style={{ background: color }}
                />
                <div className="mt-1 flex flex-col items-center gap-1">
                  <code className="text-[10px]">{color}</code>
                  <CopyButton value={color} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
