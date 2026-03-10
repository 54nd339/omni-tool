import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface GeneratorModeSwitchProps {
  mode: 'id' | 'password';
  onModeChange: (mode: 'id' | 'password') => void;
}

export function GeneratorModeSwitch({ mode, onModeChange }: GeneratorModeSwitchProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Generator</p>
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(value) => value && onModeChange(value as 'id' | 'password')}
      >
        <ToggleGroupItem value="id">UUID / ULID</ToggleGroupItem>
        <ToggleGroupItem value="password">Password</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
