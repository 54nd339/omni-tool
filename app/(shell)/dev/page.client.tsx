'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Code } from 'lucide-react';
import { DEV_TOOLS } from '@/app/lib/constants';

export default function DevDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500">
          <Code className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dev Utilities</h1>
          <p className="text-slate-600 dark:text-slate-400">Essential tools for developers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEV_TOOLS.map((tool) => (
          <button
            key={tool.href}
            onClick={() => router.push(tool.href as any)}
            className="flex items-start gap-4 p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group text-left cursor-pointer"
          >
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 group-hover:scale-110 transition-transform flex-shrink-0">
              <tool.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {tool.label}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{tool.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
