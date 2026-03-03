'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

import { ToolSkeleton } from '@/components/ui/skeleton';
import { type ToolId } from '@/lib/constants/tools';

const TOOLS: Record<ToolId, ComponentType> = {
  'api-tester': dynamic(
    () => import('@/components/tools/dev-utils/api-tester-tool').then((m) => m.ApiTesterTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'batch-image': dynamic(
    () => import('@/components/tools/image-studio/batch-image-tool').then((m) => m.BatchImageTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'aspect-ratio-pad': dynamic(
    () => import('@/components/tools/image-studio/aspect-ratio-pad-tool').then((m) => m.AspectRatioPadTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'background-remover': dynamic(
    () => import('@/components/tools/image-studio/background-remover-tool').then((m) => m.BackgroundRemoverTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  cipher: dynamic(
    () => import('@/components/tools/crypto-suite/cipher-tool').then((m) => m.CipherTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'code-formatter': dynamic(
    () => import('@/components/tools/dev-utils/code-formatter-tool').then((m) => m.CodeFormatterTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'color-palette': dynamic(
    () => import('@/components/tools/image-studio/color-palette-tool').then((m) => m.ColorPaletteTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'color-picker': dynamic(
    () => import('@/components/tools/generators/color-picker-tool').then((m) => m.ColorGradientTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'dev-misc': dynamic(
    () => import('@/components/tools/dev-utils/dev-misc-tool').then((m) => m.DevMiscTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  diagram: dynamic(
    () => import('@/components/tools/dev-utils/diagram-tool').then((m) => m.DiagramTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'data-viz': dynamic(
    () => import('@/components/tools/dev-utils/data-viz-tool').then((m) => m.DataVizTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'diff-checker': dynamic(
    () => import('@/components/tools/dev-utils/diff-checker-tool').then((m) => m.DiffCheckerTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'image-placeholder': dynamic(
    () => import('@/components/tools/generators/image-placeholder-tool').then((m) => m.ImagePlaceholderTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'hash-generator': dynamic(
    () => import('@/components/tools/crypto-suite/hash-generator-tool').then((m) => m.HashGeneratorTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'icon-generator': dynamic(
    () => import('@/components/tools/image-studio/icon-generator-tool').then((m) => m.IconGeneratorTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'image-editor': dynamic(
    () => import('@/components/tools/image-studio/image-editor-tool').then((m) => m.ImageEditorTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'image-metadata': dynamic(
    () => import('@/components/tools/image-studio/image-metadata-tool').then((m) => m.ImageMetadataTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'json-yaml-xml': dynamic(
    () => import('@/components/tools/dev-utils/json-yaml-xml-tool').then((m) => m.JsonYamlXmlTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  jwt: dynamic(
    () => import('@/components/tools/crypto-suite/jwt-tool').then((m) => m.JwtTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'markdown-preview': dynamic(
    () => import('@/components/tools/dev-utils/markdown-preview-tool').then((m) => m.MarkdownPreviewTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'media-convert': dynamic(
    () => import('@/components/tools/media-lab/format-converter-tool').then((m) => m.FormatConverterTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'media-merge': dynamic(
    () => import('@/components/tools/media-lab/media-merge-tool').then((m) => m.MediaMergeTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'media-split': dynamic(
    () => import('@/components/tools/media-lab/media-split-tool').then((m) => m.MediaSplitTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  ocr: dynamic(
    () => import('@/components/tools/image-studio/ocr-tool').then((m) => m.OcrTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'pdf-from-images': dynamic(
    () => import('@/components/tools/pdf-suite/pdf-from-images-tool').then((m) => m.PdfFromImagesTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'pdf-merge': dynamic(
    () => import('@/components/tools/pdf-suite/merge-pdfs-tool').then((m) => m.MergePdfsTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'pdf-split': dynamic(
    () => import('@/components/tools/pdf-suite/split-pdf-tool').then((m) => m.SplitPdfTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'qr-generator': dynamic(
    () => import('@/components/tools/generators/qr-generator-tool').then((m) => m.QrGeneratorTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'regex-tester': dynamic(
    () => import('@/components/tools/dev-utils/regex-tester-tool').then((m) => m.RegexTesterTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'ssh-keygen': dynamic(
    () => import('@/components/tools/crypto-suite/ssh-keygen-tool').then((m) => m.SshKeygenTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'svg-optimizer': dynamic(
    () => import('@/components/tools/image-studio/svg-optimizer-tool').then((m) => m.SvgOptimizerTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'text-encoders': dynamic(
    () => import('@/components/tools/dev-utils/text-encoders-tool').then((m) => m.TextEncodersTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  timestamp: dynamic(
    () => import('@/components/tools/dev-utils/timestamp-tool').then((m) => m.TimestampTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'uuid-generator': dynamic(
    () => import('@/components/tools/generators/uuid-generator-tool').then((m) => m.UuidGeneratorTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
};

export function ToolLoader({ toolId }: { toolId: ToolId }) {
  const Component = TOOLS[toolId];
  return <Component />;
}
