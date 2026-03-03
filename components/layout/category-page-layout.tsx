import { ToolCard } from '@/components/layout/tools/tool-card';
import { MotionWrapper } from '@/components/ui/motion-wrapper';
import { TOOL_CATEGORIES,TOOLS } from '@/lib/constants/tools';
import type { ToolCategory } from '@/types/tools';

interface CategoryPageLayoutProps {
  categoryId: ToolCategory;
}

export function CategoryPageLayout({ categoryId }: CategoryPageLayoutProps) {
  const category = TOOL_CATEGORIES.find((c) => c.id === categoryId);
  const tools = TOOLS.filter((t) => t.category === categoryId);

  return (
    <MotionWrapper className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {category?.name ?? categoryId}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {category?.description}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            toolId={tool.id}
            name={tool.name}
            description={tool.description}
            href={tool.path}
            icon={tool.icon}
          />
        ))}
      </div>
    </MotionWrapper>
  );
}
