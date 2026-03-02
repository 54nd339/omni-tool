'use client';

import { useCallback } from 'react';
import { ClipboardList, Copy, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useClipboardStore, type ClipboardClip } from '@/stores/clipboard-store';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ClipItem({ clip, onRemove }: { clip: ClipboardClip; onRemove: (id: string) => void }) {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(clip.text);
      toast.success('Copied');
    } catch {
      toast.error('Failed to copy');
    }
  }, [clip.text]);

  return (
    <div className="group flex items-start gap-2 rounded-md p-2 transition-colors hover:bg-muted">
      <button
        onClick={handleCopy}
        className="flex-1 text-left"
        aria-label={`Copy: ${clip.preview}`}
      >
        <p className="line-clamp-2 text-xs font-mono break-all">
          {clip.preview}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {timeAgo(clip.timestamp)}
          {clip.toolId && (
            <span className="ml-1 rounded bg-muted px-1 py-0.5 text-[9px]">
              {clip.toolId}
            </span>
          )}
        </p>
      </button>
      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handleCopy}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="Re-copy"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={() => onRemove(clip.id)}
          className="rounded p-1 text-muted-foreground hover:text-destructive"
          aria-label="Remove clip"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export function ClipboardManager() {
  const clips = useClipboardStore((s) => s.clips);
  const removeClip = useClipboardStore((s) => s.removeClip);
  const clearClips = useClipboardStore((s) => s.clearClips);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Clipboard manager"
        >
          <ClipboardList className="h-4 w-4" />
          {clips.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
              {clips.length > 9 ? '9+' : clips.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h3 className="text-xs font-medium">Clipboard History</h3>
          {clips.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] text-muted-foreground"
              onClick={clearClips}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
        {clips.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No clips yet. Copy something to see it here.
          </div>
        ) : (
          <ScrollArea className="max-h-[320px]">
            <div className="space-y-0.5 p-1">
              {clips.map((clip) => (
                <ClipItem key={clip.id} clip={clip} onRemove={removeClip} />
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
