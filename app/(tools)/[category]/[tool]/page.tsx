import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TOOLS } from '@/lib/constants/tools';
import { ToolPageLayout } from '@/components/layout/tool-page-layout';
import { getToolMetadata } from '@/lib/metadata';
import { type ToolId } from '@/components/shared/tool-loader';

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

  return getToolMetadata(tool.id as ToolId);
}

export default async function DynamicToolPage({ params }: ToolPageProps) {
  const { category, tool: toolSlug } = await params;
  const tool = TOOLS.find(
    (t) => t.category === category && t.path.endsWith(`/${toolSlug}`)
  );

  if (!tool) {
    notFound();
  }

  return (
    <ToolPageLayout
      toolId={tool.id as ToolId}
      title={tool.name}
      description={tool.description}
      fullWidth={tool.fullWidth}
      hideSnippets={tool.hideSnippets}
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
