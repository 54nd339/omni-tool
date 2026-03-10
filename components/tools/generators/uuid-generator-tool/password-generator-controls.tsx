import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PASSWORD_BATCH_SIZES } from '@/lib/constants/generators';

interface PasswordGeneratorControlsProps {
  custom: string;
  digits: boolean;
  length: number;
  lowercase: boolean;
  symbols: boolean;
  uppercase: boolean;
  batchSize: string;
  onBatchSizeChange: (value: string) => void;
  onCustomChange: (value: string) => void;
  onDigitsChange: (value: boolean) => void;
  onLengthChange: (value: number) => void;
  onLowercaseChange: (value: boolean) => void;
  onSymbolsChange: (value: boolean) => void;
  onUppercaseChange: (value: boolean) => void;
}

export function PasswordGeneratorControls({
  custom,
  digits,
  length,
  lowercase,
  symbols,
  uppercase,
  batchSize,
  onBatchSizeChange,
  onCustomChange,
  onDigitsChange,
  onLengthChange,
  onLowercaseChange,
  onSymbolsChange,
  onUppercaseChange,
}: PasswordGeneratorControlsProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Length: {length}</p>
        <Slider
          min={4}
          max={128}
          step={1}
          value={[length]}
          onValueChange={([value]) => onLengthChange(value ?? 16)}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={uppercase} onCheckedChange={(value) => onUppercaseChange(value === true)} />
          Uppercase
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={lowercase} onCheckedChange={(value) => onLowercaseChange(value === true)} />
          Lowercase
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={digits} onCheckedChange={(value) => onDigitsChange(value === true)} />
          Digits
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={symbols} onCheckedChange={(value) => onSymbolsChange(value === true)} />
          Symbols
        </label>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Custom Characters</p>
        <Input
          value={custom}
          onChange={(event) => onCustomChange(event.target.value)}
          placeholder="Add custom characters..."
          className="font-mono"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Batch</p>
        <ToggleGroup
          type="single"
          value={batchSize}
          onValueChange={(value) => value && onBatchSizeChange(value)}
        >
          {PASSWORD_BATCH_SIZES.map((size) => (
            <ToggleGroupItem key={size} value={size}>
              {size}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
