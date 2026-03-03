# Contributing to OmniTool

## Dev Setup

```bash
# Install dependencies
bun install

# Start dev server (Turbopack)
bun dev

# Build for production
bun run build
```

## How to Add a Tool (5 Steps)

### 1. Create the component

Create `components/tools/<category>/<tool-name>-tool.tsx`:

```tsx
'use client';

import { useState } from 'react';

export function MyNewTool() {
  const [value, setValue] = useState('');
  return (
    <div className="space-y-6">
      {/* Tool UI here */}
    </div>
  );
}
```

### 2. Create the page route

Create `app/(tools)/<category>/<tool-slug>/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/layout/tools/tool-page-layout';

export const metadata: Metadata = {
  title: 'My New Tool',
  description: 'What the tool does',
};

export default function MyNewToolPage() {
  return (
    <ToolPageLayout
      toolId="my-new-tool"
      title="My New Tool"
      description="What the tool does"
    />
  );
}
```

### 3. Register in `lib/constants/tools.ts`

Add an entry to the `TOOLS` array:

```ts
{
  id: 'my-new-tool',
  name: 'My New Tool',
  description: 'What the tool does',
  path: '/<category>/<tool-slug>',
  category: '<category-id>',
  icon: 'IconName',
  keywords: ['search', 'terms'],
},
```

### 4. Register in `components/shared/tool-loader.tsx`

Add a dynamic import entry:

```ts
'my-new-tool': dynamic(
  () => import('@/components/tools/<category>/<tool-name>-tool').then((m) => m.MyNewTool),
  { ssr: false, loading: () => <ToolSkeleton /> },
),
```

### 5. Add icon to `lib/icon-map.ts` (if new)

If the icon isn't already in the map, add it to both the import and the `ICON_MAP` object.

## New Tool Checklist

Before adding a tool, verify:

- [ ] It's developer-focused (not a general utility)
- [ ] It has enough complexity for a standalone page (otherwise, add as a tab to an existing tool)
- [ ] It requires zero or minimal new dependencies
- [ ] It doesn't overlap with an existing tool (extend instead)
- [ ] Keywords are comprehensive for command palette search
- [ ] Component is `'use client'` with `ssr: false` in tool-loader

## Category Guidelines

| Category | Path | What belongs here |
|----------|------|-------------------|
| Image Studio | `/image-studio/` | Image manipulation, conversion, metadata |
| Files & Media | `/files-media/` | PDF operations (merge, split, create) and audio/video processing |
| Crypto Suite | `/crypto/` | Hashing, encryption, JWT |
| Dev Utils | `/dev-utils/` | Formatters, converters, diffing, APIs |
| Generators | `/generators/` | QR codes, colors, UUIDs |

## Code Style

- Tailwind CSS only (no inline styles or CSS modules)
- Use `cn()` from `lib/utils.ts` for conditional classes
- Server Components by default; `'use client'` only for interactive leaves
- Heavy processing goes in Web Workers via Comlink
- Use existing UI primitives from `components/ui/`
- Keep TSX files render-focused; move substantial business logic to `lib/*` or hooks
- Avoid barrel exports/imports; use direct module imports (for example `@/hooks/use-download`)
- For Zustand, subscribe to minimal slices/selectors instead of whole-store subscriptions
- For worker-heavy tools, use existing abstractions (`useFFmpeg`, `useBgRemoval`, `usePdfOps`, `useOcr`)
