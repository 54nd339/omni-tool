import type { PasswordStrength } from '@/types/common';

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
}

export function PasswordStrengthMeter({ strength }: PasswordStrengthMeterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${strength.color}`}
          style={{ width: `${(strength.score / 6) * 100}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{strength.label}</span>
    </div>
  );
}
