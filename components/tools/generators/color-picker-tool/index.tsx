'use client';

import { Palette, Pipette } from 'lucide-react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToolParams } from '@/hooks/use-tool-params';
import { getInitialHex } from '@/lib/image/color-picker';

import { ColorPickerPanel } from './color-picker-panel';
import { GradientGenerator } from './gradient-generator';

type Tab = 'picker' | 'gradient';

export function ColorGradientTool() {
  const [params, setParams] = useToolParams({
    hex: '',
    paste: '',
    tab: 'picker',
  });

  const tab = params.tab as Tab;
  const hex = getInitialHex(params.hex || params.paste || null);

  return (
    <div className="space-y-6">
      <ToggleGroup
        type="single"
        value={tab}
        onValueChange={(value: string) => value && setParams({ tab: value as Tab })}
      >
        <ToggleGroupItem value="picker">
          <Pipette className="mr-1.5 h-3.5 w-3.5" /> Picker
        </ToggleGroupItem>
        <ToggleGroupItem value="gradient">
          <Palette className="mr-1.5 h-3.5 w-3.5" /> Gradient
        </ToggleGroupItem>
      </ToggleGroup>

      {tab === 'gradient' ? (
        <GradientGenerator />
      ) : (
        <ColorPickerPanel colorHex={hex} onHexChange={(nextHex) => setParams({ hex: nextHex })} />
      )}
    </div>
  );
}
