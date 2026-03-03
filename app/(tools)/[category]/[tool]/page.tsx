import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ToolPageLayout } from '@/components/layout/tools/tool-page-layout';
import { TOOLS } from '@/lib/constants/tools';
import { getToolMetadata } from '@/lib/metadata';

interface ToolPageProps {
  params: Promise<{
    category: string;
    tool: string;
  }>;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { category, tool: toolSlug } = await params;
  const tool = TOOLS.find(
    (t) => t.category === category && t.path.endsWith(`/${toolSlug}`)
  );

  if (!tool) return {};

  return getToolMetadata(tool.id);
}

export default async function DynamicToolPage({ params }: ToolPageProps) {
  const { category, tool: toolSlug } = await params;
  const tool = TOOLS.find(
    (t) => t.category === category && t.path.endsWith(`/${toolSlug}`)
  );

  if (!tool) {
    notFound();
  }

  const fullWidth =
    'fullWidth' in tool && typeof tool.fullWidth === 'boolean'
      ? tool.fullWidth
      : undefined;
  const hideSnippets =
    'hideSnippets' in tool && typeof tool.hideSnippets === 'boolean'
      ? tool.hideSnippets
      : undefined;

  return (
    <ToolPageLayout
      toolId={tool.id}
      title={tool.name}
      description={tool.description}
      fullWidth={fullWidth}
      hideSnippets={hideSnippets}
    />
  );
}

export async function generateStaticParams() {
  return TOOLS.map((tool) => {
    const segments = tool.path.split('/').filter(Boolean);
    return {
      category: tool.category,
      tool: segments[segments.length - 1],
    };
  });
}
