import { TOOLS } from '@/lib/constants/tools';
import type { ToolDefinition } from '@/types';
import { ToolCard } from '@/components/layout/tool-card';

interface ToolGridSectionProps {
  title: string;
  toolIds: string[];
}

export function ToolGridSection({ title, toolIds }: ToolGridSectionProps) {
  const tools = toolIds
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is ToolDefinition => t !== undefined);

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
