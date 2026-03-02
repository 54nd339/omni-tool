'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

interface ToolPageHeaderProps {
  toolId: string;
}

export function ToolPageHeader({ toolId }: ToolPageHeaderProps) {
  const addRecentTool = useSettingsStore((s) => s.addRecentTool);

  useEffect(() => {
    addRecentTool(toolId);
  }, [toolId, addRecentTool]);

  return <Breadcrumbs />;
}
