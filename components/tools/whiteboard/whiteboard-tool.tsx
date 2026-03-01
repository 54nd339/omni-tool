'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CollabButton } from '@/components/shared/collab-button';
import { Download, Trash2, Maximize2, Minimize2, Loader2, AlertCircle } from 'lucide-react';
import type { CollabSession } from '@/lib/collab/provider';
import '@excalidraw/excalidraw/index.css';

const Excalidraw = dynamic(
  async () => {
    try {
      const mod = await import('@excalidraw/excalidraw');
      return mod.Excalidraw;
    } catch (e) {
      console.warn('Excalidraw failed to load', e);
      const Fallback = () => (
        <div className="flex h-full items-center justify-center gap-2 p-6 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          Unable to load Excalidraw in this environment.
        </div>
      );
      Fallback.displayName = 'ExcalidrawFallback';
      return Fallback;
    }
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

const STORAGE_KEY = 'omnitool-whiteboard';

type ExcalidrawElement = Record<string, unknown>;
type AppState = Record<string, unknown>;

interface ExcalidrawAPI {
  getSceneElements: () => ExcalidrawElement[];
  getAppState: () => AppState;
  getFiles: () => Record<string, unknown>;
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { if (process.env.NODE_ENV === 'development') console.warn('Failed to load whiteboard state', e); }
  return null;
}

function saveState(elements: readonly ExcalidrawElement[], appState: AppState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ elements, appState: { viewBackgroundColor: appState.viewBackgroundColor } }),
    );
  } catch (e) { if (process.env.NODE_ENV === 'development') console.warn('Failed to save whiteboard state', e); }
}

export function WhiteboardTool() {
  const { resolvedTheme } = useTheme();
  const excalidrawAPI = useRef<ExcalidrawAPI | null>(null);
  const savedState = useRef(loadSavedState());
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const collabSessionRef = useRef<CollabSession | null>(null);

  const handleCollabSession = useCallback((session: CollabSession | null) => {
    collabSessionRef.current = session;
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) { if (process.env.NODE_ENV === 'development') console.warn('Fullscreen not supported', e); }
  }, []);

  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState) => {
      saveState(elements, appState);
    },
    [],
  );

  const handleExportPng = useCallback(async () => {
    const api = excalidrawAPI.current;
    if (!api) return;
    try {
      const { exportToBlob } = await import('@excalidraw/excalidraw');
      const blob = await exportToBlob({
        elements: api.getSceneElements(),
        appState: api.getAppState(),
        files: api.getFiles(),
        mimeType: 'image/png',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'whiteboard.png';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as PNG');
    } catch {
      toast.error('Export failed');
    }
  }, []);

  const handleClear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExportPng}>
          <Download className="mr-1 h-3 w-3" /> Export PNG
        </Button>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <Trash2 className="mr-1 h-3 w-3" /> Clear
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <CollabButton onSession={handleCollabSession} />
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8" aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className={isFullscreen ? 'flex-1 min-h-0' : 'h-[calc(100vh-240px)] min-h-[400px]'}>
        <div className="h-full overflow-hidden rounded-lg border border-border">
          {/* @ts-expect-error -- Excalidraw type defs drift across versions; props are correct at runtime */}
          <Excalidraw
            excalidrawAPI={(api: ExcalidrawAPI) => { excalidrawAPI.current = api; }}
            theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
            initialData={savedState.current ?? undefined}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
