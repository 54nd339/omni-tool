'use client';

import Image from 'next/image';

interface ImagePreview {
  page: number;
  url: string;
}

interface ImagePreviewsGridProps {
  imagePreviews: ImagePreview[];
}

export function ImagePreviewsGrid({ imagePreviews }: ImagePreviewsGridProps) {
  if (imagePreviews.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {imagePreviews.map((preview) => (
        <div key={preview.page} className="overflow-hidden rounded-lg border border-border">
          <Image src={preview.url} alt={`Page ${preview.page}`} width={800} height={1100} unoptimized className="w-full" />
          <p className="px-3 py-2 text-xs text-muted-foreground">Page {preview.page}</p>
        </div>
      ))}
    </div>
  );
}