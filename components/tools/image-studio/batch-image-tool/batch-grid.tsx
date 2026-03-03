'use client';

import Image from 'next/image';
import { X } from 'lucide-react';

import { useBatchImageControlsContext } from './batch-controls';

export function BatchGrid() {
  const { items, removeItem } = useBatchImageControlsContext();

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {items.map((item) => (
        <div key={item.id} className="group relative overflow-hidden rounded-md border border-border">
          <Image
            src={item.preview}
            alt={item.file.name}
            width={300}
            height={300}
            unoptimized
            className="aspect-square w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => removeItem(item.id)}
              className="rounded-full bg-background/90 p-1.5"
              aria-label={`Remove ${item.file.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {item.status === 'processing' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            </div>
          )}

          {item.status === 'done' && (
            <div className="absolute bottom-1 right-1 rounded-full bg-green-500 p-0.5">
              <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {item.status === 'error' && (
            <div className="absolute bottom-1 right-1 rounded-full bg-destructive p-0.5">
              <X className="h-2.5 w-2.5 text-white" />
            </div>
          )}

          <p className="truncate px-1 py-0.5 text-[10px] text-muted-foreground">{item.file.name}</p>
        </div>
      ))}
    </div>
  );
}
