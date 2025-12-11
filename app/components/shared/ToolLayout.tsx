'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToolLayoutProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Unified layout component for all tool pages
 * Provides consistent styling, header, and spacing
 */
export const ToolLayout: React.FC<ToolLayoutProps> = ({ icon: Icon, title, description, children }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Icon className="w-8 h-8 text-indigo-500" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
        </div>
        {description && <p className="text-slate-600 dark:text-slate-400">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};
