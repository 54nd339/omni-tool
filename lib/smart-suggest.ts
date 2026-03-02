export interface Suggestion {
  type: string;
  toolName: string;
  toolPath: string;
}

const JWT_REGEX = /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const CRON_REGEX = /^(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)/;
const URL_REGEX = /^https?:\/\/[^\s]+$/i;
const BASE64_REGEX = /^[A-Za-z0-9+/]{20,}={0,2}$/;
const CSV_REGEX = /^[^,\n]+,[^,\n]+\n/;
const SQL_KEYWORDS = /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\s/i;
const MERMAID_REGEX = /^\s*(graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|flowchart|gitGraph)\s/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function looksLikeYaml(text: string): boolean {
  const lines = text.split('\n');
  if (lines.length < 2) return false;
  const colonLines = lines.filter((l) => /^\s*[\w-]+:\s/.test(l));
  return colonLines.length >= 2;
}

export function detectContentType(text: string): Suggestion | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 3) return null;

  if (JWT_REGEX.test(trimmed)) {
    return { type: 'JWT', toolName: 'JWT Decoder', toolPath: '/crypto/jwt' };
  }

  if (trimmed.startsWith('curl ') || trimmed.startsWith('curl\t')) {
    return { type: 'cURL', toolName: 'API Tester', toolPath: '/dev-utils/api-tester' };
  }

  if (MERMAID_REGEX.test(trimmed)) {
    return { type: 'Mermaid', toolName: 'Diagram Generator', toolPath: '/dev-utils/diagram' };
  }

  if (SQL_KEYWORDS.test(trimmed)) {
    return { type: 'SQL', toolName: 'Database Playground', toolPath: '/dev-utils/db-playground' };
  }

  if (CRON_REGEX.test(trimmed) && trimmed.split(/\s+/).length >= 5 && trimmed.split(/\s+/).length <= 7) {
    return { type: 'Cron', toolName: 'Cron Builder', toolPath: '/dev-utils/cron-builder' };
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      const isArray = trimmed.startsWith('[');
      if (isArray) {
        return { type: 'JSON Array', toolName: 'Data Visualization', toolPath: '/dev-utils/data-viz' };
      }
      return { type: 'JSON', toolName: 'JSON / YAML / XML', toolPath: '/dev-utils/json-yaml-xml' };
    } catch { /* not valid json */ }
  }

  if (looksLikeYaml(trimmed)) {
    return { type: 'YAML', toolName: 'JSON / YAML / XML', toolPath: '/dev-utils/json-yaml-xml' };
  }

  if (CSV_REGEX.test(trimmed) && trimmed.split('\n').length > 2) {
    return { type: 'CSV', toolName: 'Data Visualization', toolPath: '/dev-utils/data-viz' };
  }

  if (UUID_REGEX.test(trimmed)) {
    return { type: 'UUID', toolName: 'UUID Generator', toolPath: '/generators/uuid' };
  }

  if (URL_REGEX.test(trimmed)) {
    return { type: 'URL', toolName: 'API Tester', toolPath: '/dev-utils/api-tester' };
  }

  if (BASE64_REGEX.test(trimmed) && trimmed.length > 30) {
    return { type: 'Base64', toolName: 'Text Encoders', toolPath: '/dev-utils/encoders' };
  }

  if (/^#?[0-9a-fA-F]{6}$/.test(trimmed)) {
    return { type: 'Color', toolName: 'Color Picker', toolPath: '/generators/color-picker' };
  }

  return null;
}
