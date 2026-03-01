'use client';

import dynamic from 'next/dynamic';
import { ToolSkeleton } from '@/components/ui/skeleton';

const TOOLS = {
  'api-tester': dynamic(
    () => import('@/components/tools/dev-utils/api-tester-tool').then((m) => m.ApiTesterTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'code-formatter': dynamic(
    () => import('@/components/tools/dev-utils/code-formatter-tool').then((m) => m.CodeFormatterTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'code-playground': dynamic(
    () => import('@/components/tools/dev-utils/code-playground-tool').then((m) => m.CodePlaygroundTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'cron-builder': dynamic(
    () => import('@/components/tools/dev-utils/cron-builder-tool').then((m) => m.CronBuilderTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'db-playground': dynamic(
    () => import('@/components/tools/dev-utils/db-playground-tool').then((m) => m.DbPlaygroundTool),
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
  'password-generator': dynamic(
    () => import('@/components/tools/generators/password-generator-tool').then((m) => m.PasswordGeneratorTool),
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
  'text-case': dynamic(
    () => import('@/components/tools/dev-utils/text-case-tool').then((m) => m.TextCaseTool),
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
  'ascii-art': dynamic(
    () => import('@/components/tools/generators/ascii-art-tool').then((m) => m.AsciiArtTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  'color-picker': dynamic(
    () => import('@/components/tools/generators/color-picker-tool').then((m) => m.ColorGradientTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
  cipher: dynamic(
    () => import('@/components/tools/crypto-suite/cipher-tool').then((m) => m.CipherTool),
    { ssr: false, loading: () => <ToolSkeleton /> },
  ),
} as const;

export type ToolId = keyof typeof TOOLS;

export function ToolLoader({ toolId }: { toolId: ToolId }) {
  const Component = TOOLS[toolId];
  return <Component />;
}
