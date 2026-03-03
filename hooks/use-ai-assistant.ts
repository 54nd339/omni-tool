'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [available] = useState(
    () => typeof window !== 'undefined' && !!(window.ai?.languageModel || window.LanguageModel),
  );

  return available;
}

export function useAiAssistant(params: {
  aiPanelOpen: boolean;
  setAiPanelOpen: (open: boolean) => void;
  systemPrompt: string;
}) {
  const { aiPanelOpen, setAiPanelOpen, systemPrompt } = params;
  const aiAvailable = useAiAvailable();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState(400);
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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAiPanelOpen(false);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaY = startY.current - event.clientY;
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

  const handleResizeStart = useCallback((event: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = event.clientY;
    startHeight.current = panelHeight;
    document.body.style.userSelect = 'none';
  }, [panelHeight]);

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || !aiAvailable || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const languageModel = window.LanguageModel || window.ai?.languageModel;
      if (!languageModel) {
        throw new Error('AI API not available');
      }

      const session = await languageModel.create({
        initialPrompts: [{ role: 'system', content: systemPrompt }],
        expectedLanguage: 'en',
      });

      const response = await session.prompt(text);
      session.destroy();

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to get AI response';
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Sorry, an error occurred: ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [aiAvailable, input, loading, systemPrompt]);

  return {
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
  };
}

export type { Message };