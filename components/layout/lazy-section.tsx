'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallbackHeight?: number;
  /** Number of skeleton cards to show in the placeholder grid */
  skeletonCount?: number;
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-[88px] animate-pulse rounded-xl border border-border bg-muted/40"
        />
      ))}
    </div>
  );
}

export function LazySection({
  children,
  fallbackHeight,
  skeletonCount = 6,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        children
      ) : fallbackHeight ? (
        <div style={{ height: fallbackHeight }} />
      ) : (
        <SkeletonGrid count={skeletonCount} />
      )}
    </div>
  );
}
