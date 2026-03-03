import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CategoryPageLayout } from '@/components/layout/category-page-layout';
import { TOOL_CATEGORIES } from '@/lib/constants/tools';
import { getCategoryMetadata } from '@/lib/metadata';
import type { ToolCategory } from '@/types/tools';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  return getCategoryMetadata(category);
}

export default async function DynamicCategoryPage({ params }: CategoryPageProps) {
  const { category: categoryId } = await params;
  const category = TOOL_CATEGORIES.find((c) => c.id === categoryId);

  if (!category) {
    notFound();
  }

  const prefetchesValue = (category as { prefetches?: unknown }).prefetches;
  const prefetches = Array.isArray(prefetchesValue)
    ? (prefetchesValue as readonly string[])
    : [];

  return (
    <>
      {prefetches.map((url) => (
        <link key={url} rel="prefetch" href={url} as="fetch" crossOrigin="anonymous" />
      ))}
      <CategoryPageLayout categoryId={category.id as ToolCategory} />
    </>
  );
}

export async function generateStaticParams() {
  return TOOL_CATEGORIES.map((category) => ({
    category: category.id,
  }));
}
