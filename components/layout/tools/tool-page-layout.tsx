import { ToolPageHeader } from '@/components/layout/tools/tool-page-header';
import { BookmarkButton } from '@/components/shared/bookmark-button';
import { SnippetButton } from '@/components/shared/snippet-button';
import { ToolLoader } from '@/components/shared/tool-loader';
import { MotionWrapper } from '@/components/ui/motion-wrapper';
import { type ToolId } from '@/lib/constants/tools';

interface ToolPageLayoutProps {
  toolId: ToolId;
  title: string;
  description: string;
  fullWidth?: boolean;
  hideSnippets?: boolean;
}

export function ToolPageLayout({ toolId, title, description, fullWidth, hideSnippets }: ToolPageLayoutProps) {
  return (
    <MotionWrapper className={fullWidth ? 'space-y-4' : 'mx-auto max-w-4xl space-y-6'}>
      <ToolPageHeader toolId={toolId} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {!hideSnippets && <SnippetButton toolId={toolId} />}
          <BookmarkButton toolId={toolId} />
        </div>
      </div>
      <ToolLoader toolId={toolId} />
    </MotionWrapper>
  );
}
