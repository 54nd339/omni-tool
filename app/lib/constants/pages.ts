/**
 * Page-level constants - ToolLayout props (icon, title, description)
 */

import {
  Lock,
  Hash,
  Link2,
  KeyRound,
  Code,
  FileJson,
  Code2,
  GitCompare,
  Clock,
  Layers,
  Scissors,
  Repeat2,
  Image as ImageIcon,
  Eraser,
  Maximize2,
  Square,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface PageConfig {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const PAGE_CONFIGS: Record<string, PageConfig> = {
  '/crypto/cipher': {
    icon: Lock,
    title: 'Cipher Tools',
    description: 'Encode/decode with AES, Caesar, ROT13',
  },
  '/crypto/hash': {
    icon: Hash,
    title: 'Hash Generator',
    description: 'Compute cryptographic hashes automatically for all algorithms',
  },
  '/crypto/url': {
    icon: Link2,
    title: 'URL Encode/Decode',
    description: 'Encode/decode text to/from Base64, URL, HTML, and URI formats',
  },
  '/crypto/jwt': {
    icon: KeyRound,
    title: 'JWT Encode/Decode',
    description: 'Create and verify JWT tokens with HMAC signature',
  },
  '/dev/json': {
    icon: Code,
    title: 'JSON Validator',
    description: 'Validate, format, and validate against JSON Schema',
  },
  '/dev/xml': {
    icon: Code2,
    title: 'XML Validator',
    description: 'Validate and format XML documents',
  },
  '/dev/yaml': {
    icon: FileJson,
    title: 'YAML Validator',
    description: 'Validate YAML syntax and convert to JSON',
  },
  '/dev/diff': {
    icon: GitCompare,
    title: 'Diff Checker',
    description: 'Compare two texts and visualize differences',
  },
  '/dev/time': {
    icon: Clock,
    title: 'Timestamp & Cron',
    description: 'Convert timestamps and explain cron expressions',
  },
  '/docs/merge': {
    icon: Layers,
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files',
  },
  '/docs/split': {
    icon: Scissors,
    title: 'Split PDFs',
    description: 'Split and reorder PDF pages',
  },
  '/docs/convert': {
    icon: Repeat2,
    title: 'PDF to Image',
    description: 'Convert PDF pages to PNG, JPEG, or WebP images',
  },
  '/image/background-remover': {
    icon: Eraser,
    title: 'Background Remover',
    description: 'Remove image backgrounds locally with WebAssembly',
  },
  '/image/edit': {
    icon: Maximize2,
    title: 'Image Editor',
    description: 'Resize, compress, and convert images',
  },
  '/image/aspect-ratio': {
    icon: Square,
    title: 'Aspect Ratio Pad',
    description: 'Add padding to match common aspect ratios',
  },
  '/image/icons': {
    icon: Sparkles,
    title: 'Icon Generator',
    description: 'Generate icons in multiple sizes',
  },
  '/image/create-pdf': {
    icon: Repeat2,
    title: 'Create PDF from Images',
    description: 'Convert images to PDF documents',
  },
  '/media/convert': {
    icon: Repeat2,
    title: 'Format Converter',
    description: 'Convert audio and video between formats',
  },
  '/media/merge': {
    icon: Layers,
    title: 'Media Merge',
    description: 'Combine multiple audio/video files into one',
  },
  '/media/split': {
    icon: Scissors,
    title: 'Media Split',
    description: 'Split audio/video files into segments',
  },
  '/media/repair': {
    icon: Wrench,
    title: 'Media Repair & Compress',
    description: 'Repair corrupted files and compress media',
  },
} as const;

