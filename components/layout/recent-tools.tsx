'use client';

import { useSettingsStore } from '@/stores/settings-store';
import { ToolGridSection } from './tool-grid-section';

export function RecentTools() {
  const recentIds = useSettingsStore((s) => s.recentTools);
  if (recentIds.length === 0) return null;
  return <ToolGridSection title="Recently used" toolIds={recentIds} />;
}
