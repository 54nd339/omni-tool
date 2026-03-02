'use client';

export type ToolId = string;

export function ToolLoader({ toolId }: { toolId: ToolId }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
      Tool runtime for <span className="font-medium">{toolId}</span> is being initialized.
    </div>
  );
}
