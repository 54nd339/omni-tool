'use client';

import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from '@/hooks/use-ai-assistant';
import { cn } from '@/lib/utils';

interface AssistantChatProps {
  error: string | null;
  input: string;
  loading: boolean;
  messages: Message[];
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function AssistantChat({
  error,
  input,
  loading,
  messages,
  onInputChange,
  onSubmit,
  scrollRef,
}: AssistantChatProps) {
  return (
    <>
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Ask about OmniTool&apos;s tools, get help with outputs, or generate sample data.
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-xl px-4 py-2 text-sm',
                  msg.role === 'user'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-foreground prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:leading-snug prose-a:text-accent prose-a:no-underline hover:prose-a:underline',
                )}
              >
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-muted px-4 py-2 text-sm">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
        </div>
        <div ref={scrollRef} />
      </ScrollArea>

      {error && (
        <p className="px-4 py-1 text-xs text-destructive">{error}</p>
      )}

      <form
        className="flex gap-2 border-t border-border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Input
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Ask about tools, outputs, or sample data..."
          disabled={loading}
          className="flex-1"
          aria-label="AI chat input"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !input.trim()}
          loading={loading}
        >
          {!loading && <Send className="h-4 w-4" />}
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </>
  );
}