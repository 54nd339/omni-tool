import type { MetadataRoute } from 'next';
import { TOOL_CATEGORIES, TOOLS } from '@/lib/constants/tools';

export const dynamic = 'force-static';

const BASE_URL = 'https://tools.sandeepswain.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const categoryPaths = TOOL_CATEGORIES.map((c) => c.path);
  const toolPaths = TOOLS.map((t) => t.path);

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/settings`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    ...categoryPaths.map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...toolPaths.map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
