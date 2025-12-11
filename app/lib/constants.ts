/**
 * Application-wide constants and configuration
 */

import {
  Image as ImageIcon,
  Lock,
  Code,
  FileText,
  Film,
  PenTool,
  AlertCircle,
  Archive,
  Maximize2,
  Sparkles,
  Repeat2,
  Hash,
  Link2,
  KeyRound,
  FileJson,
  Code2,
  GitCompare,
  Clock,
  Layers,
  Scissors,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

// Navigation structure
export type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  children?: Array<{ label: string; href: string }>;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Image Tools',
    icon: ImageIcon,
    href: '/image',
    children: [
      { label: 'Background Removal', href: '/image/background-removal' },
      { label: 'Image Editor', href: '/image/edit' },
      { label: 'Icon Generator', href: '/image/icons' },
    ],
  },
  {
    label: 'Cryptography',
    icon: Lock,
    href: '/crypto',
    children: [
      { label: 'Hash Generator', href: '/crypto/hash' },
      { label: 'Cipher Encode/Decode', href: '/crypto/cipher' },
      { label: 'URL Encode/Decode', href: '/crypto/url' },
      { label: 'JWT Encode/Decode', href: '/crypto/jwt' },
    ],
  },
  {
    label: 'Dev Utilities',
    icon: Code,
    href: '/dev',
    children: [
      { label: 'JSON Validator', href: '/dev/json' },
      { label: 'YAML Validator', href: '/dev/yaml' },
      { label: 'XML Validator', href: '/dev/xml' },
      { label: 'Diff Checker', href: '/dev/diff' },
      { label: 'Timestamp / Cron', href: '/dev/time' },
    ],
  },
  {
    label: 'PDF + Docs',
    icon: FileText,
    href: '/docs',
    children: [
      { label: 'Merge PDFs', href: '/docs/merge' },
      { label: 'Split / Reorder', href: '/docs/split' },
      { label: 'Compress / Repair', href: '/docs/repair' },
      { label: 'Format Converter', href: '/docs/convert' },
    ],
  },
  {
    label: 'Audio/Video Lab',
    icon: Film,
    href: '/media',
    children: [
      { label: 'Format Converter', href: '/media/convert' },
      { label: 'Merge', href: '/media/merge' },
      { label: 'Split', href: '/media/split' },
      { label: 'Compress / Repair', href: '/media/repair' },
    ],
  },
  { label: 'Whiteboard', icon: PenTool, href: '/whiteboard' },
];

// Dashboard tool cards
export type ToolCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  href: string;
};

export const TOOL_CARDS: ToolCard[] = [
  {
    title: 'Image Studio',
    description: 'Resize, Compress, Filter',
    icon: ImageIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900/20',
    href: '/image',
  },
  {
    title: 'Crypto Suite',
    description: 'Hash, Encrypt, Encode',
    icon: Lock,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    href: '/crypto',
  },
  {
    title: 'Dev Utils',
    description: 'JSON, Time, URL',
    icon: Code,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
    href: '/dev',
  },
  {
    title: 'PDF + Docs',
    description: 'Convert, merge, reorder',
    icon: FileText,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    href: '/docs',
  },
  {
    title: 'Media Lab',
    description: 'Audio / video convert',
    icon: Film,
    color: 'text-teal-500',
    bgColor: 'bg-teal-100 dark:bg-teal-900/20',
    href: '/media',
  },
  {
    title: 'Whiteboard',
    description: 'Sketch & Diagram',
    icon: PenTool,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    href: '/whiteboard',
  },
];

// Category dashboard tools
export type CategoryTool = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

export const IMAGE_TOOLS: CategoryTool[] = [
  { label: 'Background Removal', href: '/image/background-removal', description: 'Remove backgrounds from images', icon: AlertCircle },
  { label: 'Image Editor', href: '/image/edit', description: 'Resize, compress, and convert images', icon: Maximize2 },
  { label: 'Icon Generator', href: '/image/icons', description: 'Generate icons in multiple sizes', icon: Sparkles },
];

export const CRYPTO_TOOLS: CategoryTool[] = [
  { label: 'Hash Generator', href: '/crypto/hash', description: 'Generate cryptographic hashes', icon: Hash },
  { label: 'Cipher Encode/Decode', href: '/crypto/cipher', description: 'Encode and decode with ciphers', icon: Lock },
  { label: 'URL Encode/Decode', href: '/crypto/url', description: 'Encode and decode URLs and Base64', icon: Link2 },
  { label: 'JWT Encode/Decode', href: '/crypto/jwt', description: 'Create and verify JWT tokens', icon: KeyRound },
];

export const DEV_TOOLS: CategoryTool[] = [
  { label: 'JSON Validator', href: '/dev/json', description: 'Validate and format JSON data', icon: Code },
  { label: 'YAML Validator', href: '/dev/yaml', description: 'Validate and format YAML files', icon: FileJson },
  { label: 'XML Validator', href: '/dev/xml', description: 'Validate and format XML documents', icon: Code2 },
  { label: 'Diff Checker', href: '/dev/diff', description: 'Compare text and find differences', icon: GitCompare },
  { label: 'Timestamp / Cron', href: '/dev/time', description: 'Convert timestamps and parse cron expressions', icon: Clock },
];

export const DOCS_TOOLS: CategoryTool[] = [
  { label: 'Merge PDFs', href: '/docs/merge', description: 'Combine multiple PDF files', icon: Layers },
  { label: 'Split / Reorder', href: '/docs/split', description: 'Split and reorder PDF pages', icon: Scissors },
  { label: 'Compress / Repair', href: '/docs/repair', description: 'Compress and repair PDF documents', icon: Wrench },
  { label: 'Format Converter', href: '/docs/convert', description: 'Convert documents between formats', icon: Repeat2 },
];

export const MEDIA_TOOLS: CategoryTool[] = [
  { label: 'Format Converter', href: '/media/convert', description: 'Convert audio and video formats', icon: Repeat2 },
  { label: 'Merge', href: '/media/merge', description: 'Combine multiple media files', icon: Layers },
  { label: 'Split', href: '/media/split', description: 'Split media files into segments', icon: Scissors },
  { label: 'Compress / Repair', href: '/media/repair', description: 'Compress and repair media files', icon: Wrench },
];

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION: {
    COPY_FEEDBACK_DURATION: 2000,
    FADE_IN_DURATION: 500,
  },
  TEXTAREA: {
    DEFAULT_ROWS: 6,
    LARGE_ROWS: 8,
    SMALL_ROWS: 4,
  },
  IMAGE: {
    DEFAULT_QUALITY: 0.7,
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    DEFAULT_SCALE: 100,
    MIN_QUALITY: 0.1,
    MAX_QUALITY: 1.0,
    MIN_SCALE: 10,
    MAX_SCALE: 200,
  },
  HASH: {
    ALGORITHMS: ['SHA-1', 'SHA-256', 'SHA-512', 'MD5'] as const,
  },
  CRYPTO: {
    DEFAULT_SECRET: 'omnitool',
    CAESAR_SHIFT: 3,
  },
} as const;

// Type exports
export type HashAlgorithm = (typeof UI_CONSTANTS.HASH.ALGORITHMS)[number];
