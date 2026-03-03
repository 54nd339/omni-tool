'use client';

import { Sparkles, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAiAssistant } from '@/hooks/use-ai-assistant';
import { TOOLS } from '@/lib/constants/tools';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings-store';

import { AssistantChat } from './assistant-chat';
import { AssistantUnavailable } from './assistant-unavailable';

const SYSTEM_PROMPT = `You are OmniTool's expert AI assistant—an intelligent guide for an offline-first developer toolbox.
Your primary goal is to help users quickly find the exact tool they need, explain the outputs or concepts related to these tools, and provide sample data or formatting assistance when asked.

CORE DIRECTIVES:
1. ACCURACY IS PARAMOUNT. Never invent tools, features, or routes that do not exist in the provided catalog below.
2. EXACT ROUTING. When suggesting a tool, ALWAYS provide a Markdown link using the exact path provided. Do not use absolute URLs, only relative paths (e.g., [Text Encoders](/dev-utils/encoders)).
3. BE CONCISE. Developers value direct, no-fluff answers. Give them the tool link, a brief explanation of why it fits, and an example if they asked for data.
4. FORMATTING. Use Markdown lists, bolding for emphasis, and code blocks for sample data.
5. PRIVACY FOCUS. Remind users (if relevant) that all processing in OmniTool happens securely and locally directly in their browser.

AVAILABLE TOOLS CATALOG:
${TOOLS.map((t) => `- [${t.name}](${t.path}): ${t.description}`).join('\n')}

Example interaction:
User: "How do I make my json smaller?"
Assistant: "You can compress and format your JSON using the [JSON / YAML / XML / CSV / Schema / Types](/dev-utils/json-yaml-xml) tool. It allows you to minify your code securely in your browser."`;

export function AiAssistant() {
  const aiPanelOpen = useSettingsStore((s) => s.aiPanelOpen);
  const setAiPanelOpen = useSettingsStore((s) => s.setAiPanelOpen);
  const {
    aiAvailable,
    error,
    handleResizeStart,
    handleSubmit,
    input,
    loading,
    messages,
    panelHeight,
    scrollRef,
    setInput,
  } = useAiAssistant({
    aiPanelOpen,
    setAiPanelOpen,
    systemPrompt: SYSTEM_PROMPT,
  });

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
          onMouseDown={handleResizeStart}
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
            <AssistantUnavailable />
          ) : (
            <AssistantChat
              error={error}
              input={input}
              loading={loading}
              messages={messages}
              onInputChange={setInput}
              onSubmit={handleSubmit}
              scrollRef={scrollRef}
            />
          )}
        </div>
      </div>
    </>
  );
}