'use client';

import { useState, lazy, Suspense } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ToolSkeleton } from '@/components/ui/skeleton';

const ByteCounterTool = lazy(() =>
  import('./byte-counter-tool').then((m) => ({ default: m.ByteCounterTool })),
);
const ChmodCalculatorTool = lazy(() =>
  import('./chmod-calculator-tool').then((m) => ({ default: m.ChmodCalculatorTool })),
);
const OgPreviewTool = lazy(() =>
  import('./og-preview-tool').then((m) => ({ default: m.OgPreviewTool })),
);
const FakeDataTool = lazy(() =>
  import('./fake-data-tool').then((m) => ({ default: m.FakeDataTool })),
);
const UrlParserTool = lazy(() =>
  import('./url-parser-tool').then((m) => ({ default: m.UrlParserTool })),
);

const TABS = [
  { id: 'byte-counter', label: 'Byte Counter' },
  { id: 'chmod', label: 'Chmod Calculator' },
  { id: 'og-preview', label: 'OG Preview' },
  { id: 'url-parser', label: 'URL Parser' },
  { id: 'fake-data', label: 'Fake Data' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function DevMiscTool() {
  const [tab, setTab] = useState<TabId>('byte-counter');

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto -mx-1 px-1">
        <ToggleGroup
          type="single"
          value={tab}
          onValueChange={(v) => v && setTab(v as TabId)}
          className="inline-flex w-max sm:w-auto"
        >
          {TABS.map((t) => (
            <ToggleGroupItem key={t.id} value={t.id} className="whitespace-nowrap">
              {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Suspense fallback={<ToolSkeleton />}>
        {tab === 'byte-counter' && <ByteCounterTool />}
        {tab === 'chmod' && <ChmodCalculatorTool />}
        {tab === 'og-preview' && <OgPreviewTool />}
        {tab === 'url-parser' && <UrlParserTool />}
        {tab === 'fake-data' && <FakeDataTool />}
      </Suspense>
    </div>
  );
}
