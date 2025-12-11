/**
 * Shared component constants (variants, sizes, etc.)
 */

export const BUTTON_VARIANTS = {
  primary: 'bg-indigo-500 hover:bg-indigo-600 text-white',
  secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white',
  outline: 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white',
} as const;

export const BUTTON_SIZES = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

export const CSS_CLASSES = {
  DRAG_OVER: 'bg-slate-100 dark:bg-slate-700',
} as const;
