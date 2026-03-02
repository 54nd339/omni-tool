'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSettingsStore } from '@/stores/settings-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { TOOLS } from '@/lib/constants/tools';

const SYSTEM_PROMPT = `You are OmniTool's expert AI assistant—an intelligent guide for an offline-first developer toolbox.
Your primary goal is to help users quickly find the exact tool they need, explain the outputs or concepts related to these tools, and provide sample data or formatting assistance when asked.

CORE DIRECTIVES:
1. ACCURACY IS PARAMOUNT. Never invent tools, features, or routes that do not exist in the provided catalog below.
2. EXACT ROUTING. When suggesting a tool, ALWAYS provide a Markdown link using the exact path provided. Do not use absolute URLs, only relative paths (e.g., [Text Case Converter](/dev-utils/text-case)).
3. BE CONCISE. Developers value direct, no-fluff answers. Give them the tool link, a brief explanation of why it fits, and an example if they asked for data.
4. FORMATTING. Use Markdown lists, bolding for emphasis, and code blocks for sample data.
5. PRIVACY FOCUS. Remind users (if relevant) that all processing in OmniTool happens securely and locally directly in their browser.

AVAILABLE TOOLS CATALOG:
${TOOLS.map((t) => `- [${t.name}](${t.path}): ${t.description}`).join('\n')}

Example interaction:
User: "How do I make my json smaller?"
Assistant: "You can compress and format your JSON using the [JSON / YAML / XML / CSV / Schema / Types](/dev-utils/json-yaml-xml) tool. It allows you to minify your code securely in your browser."`;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

declare global {
  interface Window {
    ai?: {
      languageModel?: {
        create: (options?: {
          initialPrompts?: Array<{ role: string; content: string }>;
        }) => Promise<{
          prompt: (input: string) => Promise<string>;
          destroy: () => void;
        }>;
      };
    };
    LanguageModel?: {
      create: (options?: {
        initialPrompts?: Array<{ role: string; content: string }>;
        expectedLanguage?: string;
      }) => Promise<{
        prompt: (input: string) => Promise<string>;
        destroy: () => void;
      }>;
    };
  }
}

function useAiAvailable() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    setAvailable(
      typeof window !== 'undefined' &&
      !!(window.ai?.languageModel || window.LanguageModel)
    );
  }, []);
  return available;
}

export function AiAssistant() {
  const aiPanelOpen = useSettingsStore((s) => s.aiPanelOpen);
  const setAiPanelOpen = useSettingsStore((s) => s.setAiPanelOpen);
  const aiAvailable = useAiAvailable();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState(400); // Default height
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!aiPanelOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAiPanelOpen(false);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      // We are dragging the top edge UP to increase height.
      const deltaY = startY.current - e.clientY;
      const newHeight = Math.max(300, Math.min(window.innerHeight * 0.9, startHeight.current + deltaY));
      setPanelHeight(newHeight);
    };

    const onMouseUp = () => {
      if (isDragging.current) {
        document.body.style.userSelect = '';
        isDragging.current = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [aiPanelOpen, setAiPanelOpen]);

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || !aiAvailable || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const languageModel = window.LanguageModel || window.ai?.languageModel;
      if (!languageModel) {
        throw new Error('AI API not available');
      }

      const session = await languageModel.create({
        initialPrompts: [{ role: 'system', content: SYSTEM_PROMPT }],
        expectedLanguage: 'en',
      });

      const response = await session.prompt(text);
      session.destroy();

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(msg);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Sorry, an error occurred: ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, aiAvailable, loading]);

  if (!aiPanelOpen) return null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Close AI Assistant"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity"
        onClick={() => setAiPanelOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setAiPanelOpen(false)}
      />
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-xl border border-b-0 border-border bg-background shadow-2xl animate-slide-up-from-bottom transition-none',
        )}
        style={{ height: panelHeight }}
      >
        <div
          className="w-full h-1.5 cursor-ns-resize hover:bg-muted-foreground/20 active:bg-accent -mt-1 rounded-t-xl z-10 transition-colors"
          onMouseDown={(e) => {
            isDragging.current = true;
            startY.current = e.clientY;
            startHeight.current = panelHeight;
            document.body.style.userSelect = 'none';
          }}
          aria-hidden
        />
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold">AI Assistant</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAiPanelOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {!aiAvailable ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/50" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  The AI Assistant uses Chrome&apos;s built-in Prompt API (Gemini Nano).
                </p>
                <p className="text-sm text-muted-foreground">
                  You need Chrome 131+ with the Prompt API flag enabled.
                </p>
                <a
                  href="chrome://flags/#prompt-api-for-gemini-nano"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-accent underline hover:no-underline"
                >
                  chrome://flags/#prompt-api-for-gemini-nano
                </a>
              </div>
            </div>
          ) : (
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
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
          )}
        </div>
      </div>
    </>
  );
}
