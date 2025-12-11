'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TOOL_CARDS } from '@/app/lib/constants';

export default function HomeClient() {
  const router = useRouter();

  const handleCardClick = (href: string) => {
    router.push(href as any);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="text-center py-10">
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
              OmniTool <span className="text-indigo-500">PWA</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              A secure, offline-first utility suite that runs entirely in your browser. Zero backend. Zero data transfer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOL_CARDS.map((tool) => (
              <button
                key={tool.href}
                onClick={() => handleCardClick(tool.href)}
                className="flex items-start gap-4 p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group text-left cursor-pointer"
              >
                <div className={`p-3 rounded-lg ${tool.bgColor} ${tool.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{tool.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{tool.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
