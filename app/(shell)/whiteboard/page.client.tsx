'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';
import { PenTool, Loader2, AlertCircle } from 'lucide-react';

const Excalidraw = dynamic(
  async () => {
    try {
      const mod = await import('@excalidraw/excalidraw');
      return mod.Excalidraw;
    } catch (e) {
      console.warn('Excalidraw failed to load', e);
      return () => (
        <div className="p-6 text-sm text-amber-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Unable to load Excalidraw in this environment.
        </div>
      );
    }
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    ),
  },
);

export default function WhiteboardPage() {
  const [fallback, setFallback] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-500" /> Whiteboard
          </h2>
          <button
            onClick={() => setFallback((v) => !v)}
            className="text-xs px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white"
          >
            {fallback ? 'Try Excalidraw' : 'Use fallback'}
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white">
          {fallback ? (
            <textarea
              className="w-full h-96 p-4 bg-slate-50 dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-200"
              placeholder="Fallback sketchpad (text). Excalidraw failed to load."
            />
          ) : (
            <Excalidraw />
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Drawings stay local. If Excalidraw fails to render in your environment, toggle the fallback above.
        </p>
      </div>
    </div>
  );
};


