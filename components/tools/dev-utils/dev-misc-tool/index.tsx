'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

import { ToolSkeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToolParams } from '@/hooks/use-tool-params';
import { DEV_MISC_TABS, type DevMiscTabId } from '@/lib/constants/dev-utils';

const ByteCounterTool = dynamic(() => import('./byte-counter-tool').then((m) => m.ByteCounterTool), {
  ssr: false,
});
const ChmodCalculatorTool = dynamic(() => import('./chmod-calculator-tool').then((m) => m.ChmodCalculatorTool), {
  ssr: false,
});
const OgPreviewTool = dynamic(() => import('./og-preview-tool').then((m) => m.OgPreviewTool), {
  ssr: false,
});
const FakeDataTool = dynamic(() => import('./fake-data-tool').then((m) => m.FakeDataTool), {
  ssr: false,
});
const UrlParserTool = dynamic(() => import('./url-parser-tool').then((m) => m.UrlParserTool), {
  ssr: false,
});

export function DevMiscTool() {
  const [params, setParams] = useToolParams({ tab: 'byte-counter' });
  const tab: DevMiscTabId = DEV_MISC_TABS.some((item) => item.id === params.tab)
    ? (params.tab as DevMiscTabId)
    : 'byte-counter';

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto -mx-1 px-1">
        <ToggleGroup
          type="single"
          value={tab}
          onValueChange={(value) => value && setParams({ tab: value })}
          className="inline-flex w-max sm:w-auto"
        >
          {DEV_MISC_TABS.map((t) => (
            <ToggleGroupItem key={t.id} value={t.id} className="whitespace-nowrap">
              {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="min-h-[400px]">
        <Suspense fallback={<ToolSkeleton />}>
          {tab === 'byte-counter' && <ByteCounterTool />}
          {tab === 'chmod' && <ChmodCalculatorTool />}
          {tab === 'og-preview' && <OgPreviewTool />}
          {tab === 'url-parser' && <UrlParserTool />}
          {tab === 'fake-data' && <FakeDataTool />}
        </Suspense>
      </div>
    </div>
  );
}
