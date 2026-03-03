'use client';

import Image from 'next/image';

interface PageSelectionGridProps {
  clearSelectedPages: () => void;
  selectAllPages: () => void;
  selectedPages: Set<number>;
  thumbnails: string[];
  togglePage: (page: number) => void;
  totalPages: number;
}

export function PageSelectionGrid({
  clearSelectedPages,
  selectAllPages,
  selectedPages,
  thumbnails,
  togglePage,
  totalPages,
}: PageSelectionGridProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {totalPages} pages &middot; {selectedPages.size} selected
        </p>
        <div className="flex gap-2">
          <button
            onClick={selectAllPages}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Select all
          </button>
          <button
            onClick={clearSelectedPages}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Select none
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              onClick={() => togglePage(page)}
              className={`flex flex-col items-center gap-2 rounded-lg border p-2 text-sm transition-colors ${selectedPages.has(page)
                ? 'border-foreground bg-muted font-medium'
                : 'border-border hover:bg-muted/50'
                }`}
            >
              {thumbnails[index] ? (
                <Image
                  src={thumbnails[index]}
                  alt={`Page ${page}`}
                  width={400}
                  height={560}
                  unoptimized
                  className="h-32 w-full rounded-md object-contain sm:h-40 lg:h-48"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-md bg-muted/30 text-muted-foreground sm:h-40 lg:h-48">
                  {page}
                </div>
              )}
              <span className="text-xs text-muted-foreground">Page {page}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}