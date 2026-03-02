import type { Metadata } from 'next';
import { TOOLS, TOOL_CATEGORIES } from '@/lib/constants/tools';
import { type ToolId } from '@/components/shared/tool-loader';
import { type ToolCategoryDefinition } from '@/types';

export function getToolMetadata(toolId: ToolId): Metadata {
  const tool = TOOLS.find((t) => t.id === toolId);

  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool could not be found.',
    };
  }

  return {
    title: tool.name,
    description: tool.description,
    openGraph: {
      title: tool.name,
      description: tool.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.description,
    },
  };
}

export function getCategoryMetadata(categoryId: string): Metadata {
  const category = TOOL_CATEGORIES.find((c: ToolCategoryDefinition) => c.id === categoryId);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested tool category could not be found.',
    };
  }

  return {
    title: category.name,
    description: category.description,
    openGraph: {
      title: category.name,
      description: category.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: category.name,
      description: category.description,
    },
  };
}
