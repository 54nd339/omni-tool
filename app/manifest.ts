import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'OmniTool',
    short_name: 'OmniTool',
    description:
      'Offline-first PWA toolbox — image studio, PDF suite, media lab, crypto, and dev utils.',
    start_url: '/',
    scope: '/',
    lang: 'en',
    dir: 'ltr',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#18181b',
    orientation: 'any',
    categories: ['utilities', 'developer', 'productivity'],
    screenshots: [
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'wide',
        label: 'OmniTool dashboard',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'OmniTool mobile view',
      },
    ] as unknown as MetadataRoute.Manifest['screenshots'],
    icons: [
      {
        src: '/icons/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/favicon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Image Editor',
        short_name: 'Editor',
        url: '/image-studio/editor',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'PDF Merge',
        short_name: 'PDF',
        url: '/pdf/merge',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'JSON / YAML / XML',
        short_name: 'JSON',
        url: '/dev-utils/json-yaml-xml',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'API Tester',
        short_name: 'API',
        url: '/dev-utils/api-tester',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
    share_target: {
      action: '/share',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
        files: [
          {
            name: 'file',
            accept: ['image/*', 'application/pdf', '.json', '.yaml', '.yml', '.xml', '.csv', '.svg'],
          },
        ],
      },
    },
    file_handlers: [
      {
        action: '/pdf/merge',
        accept: { 'application/pdf': ['.pdf'] },
      },
      {
        action: '/dev-utils/json-yaml-xml',
        accept: {
          'application/json': ['.json'],
          'text/yaml': ['.yaml', '.yml'],
          'application/xml': ['.xml'],
          'text/csv': ['.csv'],
        },
      },
      {
        action: '/image-studio/svg-optimizer',
        accept: { 'image/svg+xml': ['.svg'] },
      },
      {
        action: '/image-studio/editor',
        accept: {
          'image/png': ['.png'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/webp': ['.webp'],
        },
      },
    ],
  };
}
