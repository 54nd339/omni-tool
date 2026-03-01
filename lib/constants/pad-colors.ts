import type { PadColor } from '@/types';

export const PAD_COLORS = [
  { id: 'white', label: 'White', value: '#ffffff' },
  { id: 'transparent', label: 'Transparent', value: 'transparent' },
  { id: 'custom', label: 'Custom' },
] as const satisfies readonly PadColor[];
