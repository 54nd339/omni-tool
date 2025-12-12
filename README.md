# Omni Tool

A comprehensive, offline-first web application for various utilities including crypto operations, media processing, document manipulation, image editing, and more. Built with Next.js and served as a static export.

## Features

- **Crypto Module**: Hash generation, cipher operations, JWT tools, URL encoding
- **Dev Tools**: JSON/YAML/XML formatting, time conversion, diff viewer
- **Document Tools**: PDF creation, document merging/splitting
- **Image Tools**: Aspect ratio converter, background remover, PDF creation, icon management, Image resize/compress
- **Media Tools**: Audio/video compression, format conversion, file merging/splitting, repair
- **Whiteboard**: Excalidraw integration for sketching
- **Offline-First**: Works completely offline as a PWA
- **FFmpeg.wasm**: Client-side media processing without server requirements

## Getting Started

### Development

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
bun run build
bun start
```

This creates a static export in the `out/` directory and serves it with proper headers for Cross-Origin Isolation.

## Deployment

### Docker (Recommended for Pi/Self-Hosted)

```bash
# Build image
docker build -t omni-tool .

# Run container
docker run -d -p 80:80 --name omni-tool omni-tool
```

The Docker setup includes:

- Multi-stage build (Node.js for building, Nginx for serving)
- Nginx configured with Cross-Origin Isolation headers (required for FFmpeg.wasm)
- Proper MIME types for WASM files
- SPA routing with fallback to index.html
- Optimized caching for static assets

### Manual Deployment

```bash
bun run build
bun start
```

### Nginx Configuration

If using an existing Nginx server, copy the `nginx.conf` settings to your Nginx configuration. Key requirements:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

These headers are essential for FFmpeg.wasm to use SharedArrayBuffer for multi-threaded processing.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Media Processing**: FFmpeg.wasm
- **PDF Tools**: pdf-lib, pdfjs-dist
- **Image Processing**: Sharp
- **Utilities**: Crypto-JS, js-yaml, jszip, dayjs, and more

## Architecture

### Design Principles

- **Static Export**: No server required; serves as a static SPA
- **Client-Only**: All processing happens in the browser
- **Offline-First**: Full PWA support with service worker
- **Modular Structure**: Feature-based organization with dedicated pages and components

### Folder Structure

```
app/
├── (shell)/                 # Tool modules
│   ├── crypto/              # Cipher, Hash, JWT, URL
│   ├── dev/                 # JSON, YAML, XML, Diff, Time
│   ├── docs/                # Convert, Merge, Split
│   ├── image/               # Aspect Ratio, Background Remover, PDF, Edit, Icons
│   ├── media/               # Convert, Merge, Split, Repair
│   ├── whiteboard/          # Excalidraw
│   ├── page.client.tsx
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── layout/              # AppHeader, Sidebar
│   ├── pwa/                 # ServiceWorkerProvider
│   └── shared/              # Reusable UI components
├── lib/
│   ├── hooks/               # useAsyncOperation, useMediaProcessing, useImageProcessing, etc.
│   ├── tools/               # crypto, dev, pdf, ffmpeg utilities
│   ├── types/               # Domain-specific type definitions
│   ├── utils/               # Helper functions (file, image, crypto, ffmpeg)
│   ├── constants/           # Navigation, component config, metadata
│   └── metadata.ts
├── store/                   # Zustand store
├── globals.css
├── layout.tsx
└── page.tsx

public/
├── manifest.webmanifest
├── sw.js                    # Service Worker
└── ffmpeg/                  # FFmpeg.wasm core

Root Files
├── Dockerfile               # Multi-stage build (Node + Nginx)
├── nginx.conf               # Cross-Origin Isolation headers
├── next.config.ts
├── package.json
└── tsconfig.json
```

### Key Architectural Patterns

**Page Structure**:
- Each tool feature has a `page.tsx` (static content) and `page.client.tsx` (interactive components)
- Enables static generation with client-side interactivity

**Component Organization**:
- **Layout Components**: Navigation, routing, UI shell
- **Shared Components**: Reusable UI elements (buttons, inputs, file upload, etc.)
- **PWA Components**: Service worker integration

**Data Flow**:
1. User selects a tool
2. File/input is provided via FileUpload or TextAreaInput
3. Client-side processing via hooks (useAsyncOperation, useMediaProcessing, etc.)
4. Results displayed via ResultDisplay or SuccessResult component

**FFmpeg Integration**:
- Handled by `useMediaProcessing` hook
- FFmpeg core files loaded from `/public/ffmpeg/`
- Requires Cross-Origin Isolation headers for SharedArrayBuffer
- Supports compress, merge, split, convert, repair operations

**Type Safety**:
- Domain-specific types in `app/lib/types/`
- Tool-specific utilities in `app/lib/tools/`
- Helper utilities in `app/lib/utils/`

## Notes

- FFmpeg.wasm requires Cross-Origin Isolation headers for SharedArrayBuffer support
- The application is fully functional offline once loaded
- All heavy operations (media processing, crypto, etc.) happen on the client side
- No data is sent to external servers
