import type { AspectRatio } from '@/types';

export const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square 1:1', width: 1, height: 1, hint: 'Avatars, thumbnails' },
  { id: '4:5', label: 'Portrait 4:5', width: 4, height: 5, hint: 'Portrait prints' },
  { id: '3:2', label: 'Classic 3:2', width: 3, height: 2, hint: 'DSLR photos' },
  { id: '16:9', label: 'Widescreen 16:9', width: 16, height: 9, hint: 'Slides, video' },
  { id: '9:16', label: 'Vertical 9:16', width: 9, height: 16, hint: 'Stories, shorts' },
  { id: 'A4', label: 'A4 210×297', width: 210, height: 297, hint: 'Print friendly' },
  { id: '3:4', label: 'Tablet 3:4', width: 3, height: 4, hint: 'Tablets, e-readers' },
  { id: 'custom', label: 'Custom', width: 1, height: 1, hint: 'Pick your own ratio' },
] as const satisfies readonly AspectRatio[];
