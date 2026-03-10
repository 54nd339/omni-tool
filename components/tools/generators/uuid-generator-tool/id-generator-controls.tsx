import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { UUID_BATCH_SIZES } from '@/lib/constants/generators';
import type { IdType } from '@/types/common';

interface IdGeneratorControlsProps {
  idBatchSize: string;
  idType: IdType;
  onIdBatchSizeChange: (value: string) => void;
  onIdTypeChange: (value: IdType) => void;
}

export function IdGeneratorControls({
  idBatchSize,
  idType,
  onIdBatchSizeChange,
  onIdTypeChange,
}: IdGeneratorControlsProps) {
  return (
    <div className="flex flex-wrap gap-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Type</p>
        <ToggleGroup
          type="single"
          value={idType}
          onValueChange={(value) => value && onIdTypeChange(value as IdType)}
        >
          <ToggleGroupItem value="uuid">UUID v4</ToggleGroupItem>
          <ToggleGroupItem value="ulid">ULID</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Batch</p>
        <ToggleGroup
          type="single"
          value={idBatchSize}
          onValueChange={(value) => value && onIdBatchSizeChange(value)}
        >
          {UUID_BATCH_SIZES.map((size) => (
            <ToggleGroupItem key={size} value={size}>
              {size}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
