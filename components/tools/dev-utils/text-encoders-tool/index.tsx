'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToolParams } from '@/hooks/use-tool-params';
import { TEXT_ENCODER_TABS, type TextEncoderTab } from '@/lib/constants/dev-utils';

import { Base64Panel } from './base64-panel';
import { CasePanel } from './case-panel';
import { HtmlEntitiesPanel } from './html-entities-panel';
import { UrlPanel } from './url-panel';

export function TextEncodersTool() {
  const [params, setParams] = useToolParams({ tab: 'base64' });
  const searchParams = useSearchParams();
  const initialPaste = useMemo(() => {
    const pasteParam = searchParams.get('paste');
    return pasteParam ? decodeURIComponent(pasteParam) : '';
  }, [searchParams]);
  const tab = params.tab as TextEncoderTab;

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Encoder</p>
        <ToggleGroup
          type="single"
          value={tab}
          onValueChange={(v) => v && setParams({ tab: v as TextEncoderTab })}
        >
          {TEXT_ENCODER_TABS.map((item) => (
            <ToggleGroupItem key={item.id} value={item.id}>{item.label}</ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {tab === 'base64' && <Base64Panel initialPaste={initialPaste} />}
      {tab === 'url' && <UrlPanel />}
      {tab === 'html' && <HtmlEntitiesPanel />}
      {tab === 'case' && <CasePanel />}
    </div>
  );
}
