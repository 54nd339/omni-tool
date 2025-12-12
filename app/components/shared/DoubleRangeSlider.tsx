import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/app/lib/utils';
import { DoubleRangeSliderProps } from '@/app/lib/types';

export const DoubleRangeSlider: FC<DoubleRangeSliderProps> = ({
  label,
  startValue,
  endValue,
  min,
  max,
  step = 1,
  startDisplayValue,
  endDisplayValue,
  onStartChange,
  onEndChange,
  className,
  error,
}) => {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragTypeRef = useRef<'start' | 'end' | null>(null);
  const callbacksRef = useRef({ onStartChange, onEndChange, startValue, endValue, min, max, step });

  // Update refs when values change
  useEffect(() => {
    callbacksRef.current = { onStartChange, onEndChange, startValue, endValue, min, max, step };
  }, [onStartChange, onEndChange, startValue, endValue, min, max, step]);

  const startDisplay = startDisplayValue !== undefined ? startDisplayValue : startValue;
  const endDisplay = endDisplayValue !== undefined ? endDisplayValue : endValue;

  const getPercentage = (value: number) => ((value - min) / (max - min)) * 100;

  const handleMouseDown = useCallback((type: 'start' | 'end') => {
    dragTypeRef.current = type;
    setIsDragging(type);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragTypeRef.current || !containerRef.current) return;

    const { min, max, step, startValue, endValue, onStartChange, onEndChange } = callbacksRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const value = Math.round(min + (percentage / 100) * (max - min));

    if (dragTypeRef.current === 'start') {
      const clampedValue = Math.max(min, Math.min(value, endValue - step));
      onStartChange(clampedValue);
    } else {
      const clampedValue = Math.max(startValue + step, Math.min(value, max));
      onEndChange(clampedValue);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragTypeRef.current = null;
    setIsDragging(null);
  }, []);

  // Add event listeners for mouse move and up using useEffect
  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const startPercent = getPercentage(startValue);
  const endPercent = getPercentage(endValue);

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative" ref={containerRef}>
        {/* Track */}
        <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
          {/* Active range */}
          <div
            className="absolute h-2 bg-indigo-500 dark:bg-indigo-600 rounded-full"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
          />
          {/* Start thumb */}
          <div
            className="absolute w-4 h-4 bg-indigo-600 dark:bg-indigo-500 rounded-full cursor-grab active:cursor-grabbing shadow-md transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-10"
            style={{ left: `${startPercent}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleMouseDown('start');
            }}
          />
          {/* End thumb */}
          <div
            className="absolute w-4 h-4 bg-indigo-600 dark:bg-indigo-500 rounded-full cursor-grab active:cursor-grabbing shadow-md transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-10"
            style={{ left: `${endPercent}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleMouseDown('end');
            }}
          />
        </div>
        {/* Value displays */}
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
          <span>
            Start: {typeof startDisplay === 'number' ? startDisplay : startDisplay}
          </span>
          <span>
            End: {typeof endDisplay === 'number' ? endDisplay : endDisplay}
          </span>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
