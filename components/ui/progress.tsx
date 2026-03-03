'use client';

import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

interface ProgressProps extends ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  label?: string;
}

export const Progress = forwardRef<
  ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, label, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    aria-label={label ?? 'Progress'}
    aria-valuetext={value != null ? `${Math.round(value)}%` : undefined}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-muted',
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn('h-full w-full flex-1 bg-foreground transition-all', indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = 'Progress';
