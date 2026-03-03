'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);

  const handleMove = useCallback(
    (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setPosition((x / rect.width) * 100);
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const el = containerRef.current;
      if (!el) return;
      el.setPointerCapture(e.pointerId);
      handleMove(e.clientX);
    },
    [handleMove],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current?.hasPointerCapture(e.pointerId)) return;
      handleMove(e.clientX);
    },
    [handleMove],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPosition((p) => Math.max(0, p - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPosition((p) => Math.min(100, p + step));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label="Before/after comparison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      className={cn(
        'relative cursor-col-resize select-none overflow-hidden rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
    >
      <Image
        src={afterSrc}
        alt={afterLabel}
        width={2000}
        height={2000}
        unoptimized
        className="block h-auto w-full max-h-[inherit] object-contain object-center"
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <Image
          src={beforeSrc}
          alt={beforeLabel}
          width={2000}
          height={2000}
          unoptimized
          className="block h-auto w-full max-w-none object-contain object-center"
        />
      </div>
      <div
        className="absolute inset-y-0 w-0.5 bg-foreground/80 shadow"
        style={{ left: `${position}%` }}
      >
        <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground/80 bg-background/60 backdrop-blur-sm" />
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-background/60 px-2 py-0.5 text-xs text-foreground backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-background/60 px-2 py-0.5 text-xs text-foreground backdrop-blur-sm">
        {afterLabel}
      </span>
    </div>
  );
}
