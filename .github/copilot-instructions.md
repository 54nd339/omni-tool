---
description: OmniTool project coding conventions and architecture rules
---

# OmniTool Conventions

## Architecture

- Follow SOLID, DRY, KISS principles. Prefer minimal diffs.
- Optimize for clarity, correctness, and performance first.
- Components are **dumb and presentational only**. Keep business logic in `lib/`, `hooks/`, `stores/`, `providers/`, or `workers/`.
- Default to Server Components. Add `'use client'` only on interactive leaf components.
- Tool page pattern:
  - `app/(tools)/<category>/<tool>/page.tsx` stays a Server Component.
  - Export `metadata` and render the client tool from `components/tools/<category>/`.
- Use `next/link` instead of `<a>` and `next/image` instead of `<img>`.
- Match existing naming, folder layout, and patterns before introducing abstractions.

## Tool Scope

- Prefer consolidation over proliferation.
  - Small/simple utilities should be tabs or sections inside existing tools.
  - Add standalone tool routes only when workflow complexity clearly justifies it.
- Prioritize developer-facing, high-frequency workflows over novelty.
- New tool checklist:
  1. Is it developer-focused?
  2. Is standalone complexity justified?
  3. Does it add minimal dependencies?
  4. Can state be URL-shareable (`useToolParams` / `nuqs`)?
  5. Does it avoid overlap with existing tools?

## Workers

- Heavy tasks MUST run in Comlink workers:
  - FFmpeg/media/image ops
  - Background removal
  - PDF operations
  - OCR
- Use existing hooks: `useFFmpeg`, `useBgRemoval`, `usePdfOps`, `useOcr`.
- Keep light transforms (text formatting, basic encoding, hashing) on the main thread.

## State Management

- Use small, atomic Zustand stores.
- Export selectors and subscribe to minimal slices to avoid unnecessary re-renders.
- Avoid prop drilling; use stores, context, or composition.

## Styling

- Use Tailwind utility classes and existing design tokens in `app/globals.css`.
- Order classes logically: **layout → box model → visual → typography**.
  - Example: `flex items-center gap-2 p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-sm font-medium text-zinc-900`
- Use `next-themes` for light/dark mode. Reference theme via `dark:` variant.
- Tailwind-only styling; avoid inline styles and CSS modules unless already established in-file.
- No ad-hoc visual systems; follow existing component primitives in `components/ui` and `components/shared`.
- Preserve keyboard-first UX and accessibility patterns (Radix primitives, focus states, escape handling).
- Respect reduced-motion preferences.

## Module Boundaries

- Do not introduce barrel imports/exports (`index.ts` re-export hubs).
- Prefer direct module imports (for example, `@/components/ui/button`) to keep dev dependency graphs smaller.
- Keep module boundaries explicit and avoid broad re-export surfaces.

## Imports & Bundle

- Remove unused imports and dead code immediately.
- Merge duplicate imports from the same module.
- Import order:
  1. third-party
  2. internal aliases (`@/...`)
  3. relative imports
- Sort imports alphabetically inside each group.
- Prefer `import { value, type TypeName } from 'module'` style for type specifiers.
- Prefer tree-shakable named imports.
- Keep heavy libraries lazy-loaded (`import()` / `next/dynamic`) where applicable.
- Reuse existing libraries for known problems; do not reimplement library features already in the stack.

## Repo Conventions

- Canonical tool registry is `lib/constants/tools.ts`.
- Shared primitives live in `components/ui/` and `components/shared/`.
- Route/layout shell logic belongs in `components/layout/`.
- Use worker functionality through hooks/lib abstractions, not ad-hoc worker wiring in UI files.

## TypeScript

- Use strict TypeScript.
- Avoid `any` unless unavoidable and scoped.
- Prefer `interface` for object shapes and `type` for unions/intersections.
- Use `as const` for configuration literals.

## Notifications

- Use `sonner` toasts for feedback.
- Never use `window.alert` or `window.confirm`.

## Icons

- Use `lucide-react` only.
- Prefer named, tree-shakable icon imports.

## Comments

- Comments should explain **why**, not **what**.

## Workflow

- Keep commits scoped to one concern.
- Do not add features outside the request scope.
- If requirements conflict, choose the simplest behavior-preserving interpretation.
- Update docs when behavior or architecture changes.
