import type { Metadata } from 'next';

type RouteMeta = {
  title: string;
  description: string;
};

const ROUTE_METADATA: Record<string, RouteMeta> = {
  '/': { title: 'Dashboard', description: 'Offline-first utility suite dashboard' },
  '/image': { title: 'Image Tools', description: 'Process, edit, and convert images' },
  '/image/background-removal': { title: 'Background Removal', description: 'Remove image backgrounds with AI' },
  '/image/edit': { title: 'Image Editor', description: 'Resize, compress, and convert images' },
  '/image/icons': { title: 'Icon Generator', description: 'Generate icons in multiple sizes' },
  '/crypto': { title: 'Cryptography', description: 'Hash, encrypt, and encode data' },
  '/crypto/hash': { title: 'Hash Generator', description: 'Generate cryptographic hashes' },
  '/crypto/cipher': { title: 'Cipher Tools', description: 'Encode and decode with ciphers' },
  '/crypto/url': { title: 'URL Encode/Decode', description: 'Encode and decode URLs and Base64' },
  '/crypto/jwt': { title: 'JWT Encode/Decode', description: 'Create and verify JWT tokens' },
  '/dev': { title: 'Dev Utilities', description: 'Developer tools and validators' },
  '/dev/json': { title: 'JSON Validator', description: 'Validate and format JSON data' },
  '/dev/yaml': { title: 'YAML Validator', description: 'Validate and format YAML files' },
  '/dev/xml': { title: 'XML Validator', description: 'Validate and format XML documents' },
  '/dev/diff': { title: 'Diff Checker', description: 'Compare text and visualize differences' },
  '/dev/time': { title: 'Timestamp & Cron', description: 'Convert timestamps and parse cron expressions' },
  '/docs': { title: 'PDF + Docs', description: 'Manage and convert PDF documents' },
  '/docs/merge': { title: 'Merge PDFs', description: 'Combine multiple PDF files' },
  '/docs/split': { title: 'Split / Reorder PDFs', description: 'Split and reorder PDF pages' },
  '/docs/repair': { title: 'Compress / Repair PDFs', description: 'Compress and repair PDF documents' },
  '/docs/convert': { title: 'PDF Format Converter', description: 'Convert PDFs to other formats' },
  '/media': { title: 'Audio/Video Lab', description: 'Process and convert media files' },
  '/media/convert': { title: 'Media Format Converter', description: 'Convert audio and video formats' },
  '/media/merge': { title: 'Merge Media', description: 'Combine multiple media files' },
  '/media/split': { title: 'Split Media', description: 'Split media files into segments' },
  '/media/repair': { title: 'Compress / Repair Media', description: 'Compress and repair media files' },
  '/whiteboard': { title: 'Whiteboard', description: 'Sketch and diagram collaboratively' },
};

const DEFAULT_META: Metadata = {
  title: 'OmniTool PWA',
  description: 'Offline-first, client-only utility suite',
};

export const getRouteMetadata = (path: string): Metadata => {
  const meta = ROUTE_METADATA[path];
  if (!meta) return DEFAULT_META;
  return {
    title: `${meta.title} | OmniTool`,
    description: meta.description,
  };
};
