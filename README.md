# OmniTool

OmniTool is an offline-first, browser-based developer toolbox built with Next.js. Most operations run locally in your browser (including media/PDF/image processing) using WebAssembly and Web Workers.

## Current Scope

- **34 tools** across **5 categories** (source of truth: `lib/constants/tools.ts`)
- Categories:
  - **Image Studio (9)**: background removal, OCR, image editor, metadata, SVG optimization, batch processing, and more
  - **Files & Media (6)**: merge/split/create PDFs, convert/merge/split audio-video
  - **Crypto Suite (4)**: hash, cipher, JWT, SSH key generation
  - **Dev Utils (11)**: API tester, format tools, diff checker, markdown editor, diagram generator, and more
  - **Generators (4)**: QR, UUID/ULID, color/gradient, placeholders

## Key Capabilities

- PWA with offline fallback route (`/_offline`)
- In-browser heavy processing via workers (FFmpeg, OCR, PDF, background removal)
- Command palette, keyboard shortcuts, favorites, bookmarks, snippets, recent history
- Smart content routing (`lib/smart-suggest.ts`) and tool chaining (“Send to…”)
- Theme support and accessibility-focused UI (Radix primitives + keyboard-first patterns)

## Tech Stack

- **Framework**: Next.js 16
- **Runtime / Package Manager**: Bun
- **UI**: Tailwind CSS v4, Radix UI, Lucide, Motion
- **State**: Zustand
- **Workers**: Comlink + dedicated workers in `workers/`
- **Core libs**: `@ffmpeg/ffmpeg`, `pdf-lib`, `pdfjs-dist`, `tesseract.js`, `@imgly/background-removal`, `@monaco-editor/react`

## Local Development

```bash
bun install
bun dev
```

App runs at [http://localhost:3000](http://localhost:3000).

### Available scripts

- `bun dev` — start dev server (Turbopack)
- `bun run build` — production build/export
- `bun run start` — serve static `out/` directory
- `bun run lint` — run ESLint

## Build & Export

```bash
bun run build
```

Production build uses static export (`output: 'export'`) and writes output to `out/`.

## Docker

```bash
docker build -t omni-tool .
docker run -d -p 3000:80 --name omni-tool omni-tool
```

Nginx serves the static export from `out/` using `nginx.conf`.

### Published Images

- `54nd33p/omnitool:latest` → `master` (default toolset)
- `54nd33p/omnitool:extras` → `extras` branch (includes Code Playground, Database Playground, Whiteboard, ASCII Art)

To run extras:

```bash
docker pull 54nd33p/omnitool:extras
docker run -d -p 3000:80 --name omni-tool-extras 54nd33p/omnitool:extras
```

## Cross-Origin Isolation (Required)

FFmpeg/WebAssembly workflows rely on `SharedArrayBuffer`, so responses must include:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

This is already handled in:

- `next.config.ts` (development headers)
- `nginx.conf` (production/self-hosted)

If deploying to other platforms, ensure these headers are configured there as well.

## CI/CD

Docker image workflows are defined in:

- `.github/workflows/docker-merge.yml` (push to `master` and `extras`)
- `.github/workflows/docker-pull-request.yml` (pull requests from same repo)

## Repository Layout

```text
app/            Next.js routes and metadata
components/     UI, layout, shared, and tool components
hooks/          React hooks (workers, tool params, shortcuts, etc.)
lib/            Core logic, constants, data utilities
providers/      App-level providers
stores/         Zustand stores
types/          Shared TypeScript types
workers/        Web Worker entry points
public/         Static assets and PWA artifacts
```
