/**
 * Navigation, metadata, and page configuration constants
 */

import type { Metadata } from 'next';
import {
  Image as ImageIcon,
  Lock,
  Code,
  FileText,
  Film,
  PenTool,
  AlertCircle,
  Maximize2,
  Sparkles,
  Repeat2,
  Square,
  Hash,
  Link2,
  KeyRound,
  FileJson,
  Code2,
  GitCompare,
  Clock,
  Layers,
  Scissors,
  type LucideIcon,
} from 'lucide-react';

// Category dashboard tools - source of truth for individual tool pages
export type CategoryTool = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

export const IMAGE_TOOLS: CategoryTool[] = [
  { label: 'Background Remover', href: '/image/background-remover', description: 'Remove image backgrounds locally', icon: AlertCircle },
  { label: 'Aspect Ratio Pad', href: '/image/aspect-ratio', description: 'Add padding to match aspect ratios', icon: Square },
  { label: 'Image Editor', href: '/image/edit', description: 'Resize, compress, and convert images', icon: Maximize2 },
  { label: 'Icon Generator', href: '/image/icons', description: 'Generate icons in multiple sizes', icon: Sparkles },
  { label: 'Create PDF', href: '/image/create-pdf', description: 'Convert images to PDF documents', icon: Repeat2 },
];

export const CRYPTO_TOOLS: CategoryTool[] = [
  { label: 'Hash Generator', href: '/crypto/hash', description: 'Compute cryptographic hashes against all algorithms', icon: Hash },
  { label: 'Cipher Encode/Decode', href: '/crypto/cipher', description: 'Encode/decode with AES, Caesar, ROT13', icon: Lock },
  { label: 'URL Encode/Decode', href: '/crypto/url', description: 'Encode/decode text to/from Base64, URL, HTML, and URI formats', icon: Link2 },
  { label: 'JWT Encode/Decode', href: '/crypto/jwt', description: 'Create and verify JWT tokens with HMAC signature', icon: KeyRound },
];

export const DEV_TOOLS: CategoryTool[] = [
  { label: 'JSON Validator', href: '/dev/json', description: 'Validate, format, and validate against JSON Schema', icon: Code },
  { label: 'YAML Validator', href: '/dev/yaml', description: 'Validate YAML syntax and convert to JSON', icon: FileJson },
  { label: 'XML Validator', href: '/dev/xml', description: 'Validate and format XML documents', icon: Code2 },
  { label: 'Diff Checker', href: '/dev/diff', description: 'Compare two texts and visualize differences', icon: GitCompare },
  { label: 'Timestamp / Cron', href: '/dev/time', description: 'Convert timestamps and explain cron expressions', icon: Clock },
];

export const DOCS_TOOLS: CategoryTool[] = [
  { label: 'Merge PDFs', href: '/docs/merge', description: 'Combine multiple PDF files', icon: Layers },
  { label: 'Split PDFs', href: '/docs/split', description: 'Split and reorder PDF pages', icon: Scissors },
  { label: 'PDF to Image', href: '/docs/convert', description: 'Convert PDF pages to images', icon: Repeat2 },
];

export const MEDIA_TOOLS: CategoryTool[] = [
  { label: 'Format Converter', href: '/media/convert', description: 'Convert, repair, and compress audio/video files', icon: Repeat2 },
  { label: 'Media Merge', href: '/media/merge', description: 'Combine multiple audio/video files into one', icon: Layers },
  { label: 'Media Split', href: '/media/split', description: 'Split audio/video files into multiple segments', icon: Scissors },
];

// Dashboard tool cards - source of truth for category pages
export type NavItem = {
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  href: string;
  children: CategoryTool[] | null;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Image Studio',
    description: 'Process, edit, and convert images',
    icon: ImageIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900/20',
    href: '/image',
    children: IMAGE_TOOLS,
  },
  {
    label: 'Crypto Suite',
    description: 'Hash, encrypt, and encode data',
    icon: Lock,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    href: '/crypto',
    children: CRYPTO_TOOLS,
  },
  {
    label: 'Dev Utils',
    description: 'Developer tools and validators',
    icon: Code,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
    href: '/dev',
    children: DEV_TOOLS,
  },
  {
    label: 'PDF + Docs',
    description: 'Manage and convert PDF documents',
    icon: FileText,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    href: '/docs',
    children: DOCS_TOOLS,
  },
  {
    label: 'Media Lab',
    description: 'Process and convert media files',
    icon: Film,
    color: 'text-teal-500',
    bgColor: 'bg-teal-100 dark:bg-teal-900/20',
    href: '/media',
    children: MEDIA_TOOLS,
  },
  {
    label: 'Whiteboard',
    description: 'Sketch and diagram collaboratively',
    icon: PenTool,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    href: '/whiteboard',
    children: null,
  },
];

// Page configuration - derived from TOOL_CARDS and CategoryTool arrays
export interface PageConfig {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const PAGE_CONFIGS: Record<string, PageConfig> = {
  // Root dashboard
  '/': {
    icon: ImageIcon,
    title: 'Dashboard',
    description: 'Offline-first utility suite dashboard',
  },
  // Category pages - derived from TOOL_CARDS
  ...Object.fromEntries(
    NAV_ITEMS.map(card => [
      card.href, { icon: card.icon, title: card.label, description: card.description, },
    ])
  ),
  // Individual tool pages - derived from CategoryTool arrays
  ...Object.fromEntries(
    [...IMAGE_TOOLS, ...CRYPTO_TOOLS, ...DEV_TOOLS, ...DOCS_TOOLS, ...MEDIA_TOOLS].map(tool => [
      tool.href, { icon: tool.icon, title: tool.label, description: tool.description, },
    ])
  ),
} as const;

// Metadata helper function
const DEFAULT_META: Metadata = {
  title: 'OmniTool PWA',
  description: 'Offline-first, client-only utility suite',
};

export const getRouteMetadata = (path: string): Metadata => {
  const config = PAGE_CONFIGS[path];
  if (!config) return DEFAULT_META;
  return {
    title: `${config.title} | OmniTool`,
    description: config.description,
  };
};
