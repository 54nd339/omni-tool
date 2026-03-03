import { ToolCard } from '@/components/layout/tools/tool-card';
import { resolveToolsByIds } from '@/lib/constants/tools';

interface ToolGridSectionProps {
  title: string;
  toolIds: string[];
}

export function ToolGridSection({ title, toolIds }: ToolGridSectionProps) {
  const tools = resolveToolsByIds(toolIds);

  if (tools.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        {title}
      </h2>
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
    </section>
  );
}
