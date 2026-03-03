'use client';

import { useEffect } from 'react';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { useSettingsStore } from '@/stores/settings-store';

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
