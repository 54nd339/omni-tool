import { Progress } from '@/components/ui/progress';

interface ProcessingProgressProps {
  label: string;
  progress?: number;
}

export function ProcessingProgress({ label, progress }: ProcessingProgressProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {label}
        {typeof progress === 'number' ? ` ${progress}%` : ''}
      </p>
      <Progress value={progress} />
    </div>
  );
}
