'use client';

import { ToolGridSection } from '@/components/layout/tools/tool-grid-section';
import { useSettingsStore } from '@/stores/settings-store';

export function RecentTools() {
  const recentIds = useSettingsStore((s) => s.recentTools);
  if (recentIds.length === 0) return null;
  return <ToolGridSection title="Recently used" toolIds={recentIds} />;
}
