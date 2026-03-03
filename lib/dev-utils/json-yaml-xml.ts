import type { DataFormat } from '@/types/common';

export type TsKind = 'interface' | 'type';
export type OptionalMode = 'required' | 'optional';
export type CsvDelimiter = ',' | ';' | '\t';

export const JSON_YAML_XML_FORMATS = ['json', 'yaml', 'xml', 'csv'] as const satisfies readonly DataFormat[];

export const SAMPLE_JSON_SCHEMA = `{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer", "minimum": 0 },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["name", "email"]
}`;

export interface ParsedJsonState {
  ok: boolean;
  error: string | null;
  data: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function inferSchema(value: unknown): Record<string, unknown> {
  if (value === null) return { type: 'null' };
  if (Array.isArray(value)) {
    return { type: 'array', items: value.length > 0 ? inferSchema(value[0]) : {} };
  }
  if (typeof value === 'object') {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      properties[key] = inferSchema(val);
      required.push(key);
    }
    return { type: 'object', properties, required };
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
  }
  return { type: typeof value };
}

function toPascalCase(str: string): string {
  return (
    str
      .replace(/(?:^|[-_\s])([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '') || 'Item'
  );
}

function generateInterfaceName(keyHint: string, suffix: string, usedNames: Set<string>): string {
  const base = toPascalCase(keyHint || suffix);
  let name = base;
  let index = 0;
  while (usedNames.has(name)) {
    name = `${base}${index}`;
    index++;
  }
  usedNames.add(name);
  return name;
}

function getTsType(
  value: unknown,
  kind: TsKind,
  optional: OptionalMode,
  interfaceMap: Map<string, string>,
  usedNames: Set<string>,
  keyHint: string,
): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const types = new Set<string>();
    for (let index = 0; index < value.length; index++) {
      const element = value[index];
      if (element !== null && typeof element === 'object' && !Array.isArray(element)) {
        const name =
          interfaceMap.get(JSON.stringify(element)) ??
          interfaceMap.get(JSON.stringify(value[0])) ??
          generateInterfaceName(keyHint, 'Item', usedNames);
        types.add(name);
      } else {
        types.add(getTsType(element, kind, optional, interfaceMap, usedNames, `${keyHint}_${index}`));
      }
    }
    const arrayTypes = [...types];
    if (arrayTypes.length === 1) return `${arrayTypes[0]}[]`;
    return `(${arrayTypes.join(' | ')})[]`;
  }

  if (typeof value === 'object' && value !== null) {
    return interfaceMap.get(JSON.stringify(value)) ?? 'Record<string, unknown>';
  }

  return 'unknown';
}

function generateInterfaces(
  value: unknown,
  kind: TsKind,
  optional: OptionalMode,
  interfaceMap: Map<string, string>,
  usedNames: Set<string>,
): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [];

  const lines: string[] = [];
  const objectValue = value as Record<string, unknown>;
  const name = interfaceMap.get(JSON.stringify(value));
  if (!name) return lines;

  const entries: string[] = [];
  for (const [key, nestedValue] of Object.entries(objectValue)) {
    const optionalModifier = optional === 'optional' ? '?' : '';
    const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key.replace(/'/g, "\\'")}'`;

    if (nestedValue !== null && typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
      const nestedName = interfaceMap.get(JSON.stringify(nestedValue));
      if (nestedName) {
        lines.push(...generateInterfaces(nestedValue, kind, optional, interfaceMap, usedNames));
        entries.push(`  ${formattedKey}${optionalModifier}: ${nestedName};`);
      } else {
        entries.push(`  ${formattedKey}${optionalModifier}: Record<string, unknown>;`);
      }
      continue;
    }

    if (Array.isArray(nestedValue) && nestedValue.length > 0) {
      const first = nestedValue[0];
      if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
        const nestedName = interfaceMap.get(JSON.stringify(first));
        if (nestedName) {
          lines.push(...generateInterfaces(first, kind, optional, interfaceMap, usedNames));
          entries.push(`  ${formattedKey}${optionalModifier}: ${nestedName}[];`);
        } else {
          const elemType = getTsType(first, kind, optional, interfaceMap, usedNames, key);
          entries.push(`  ${formattedKey}${optionalModifier}: ${elemType}[];`);
        }
      } else {
        const elemTypes = new Set<string>();
        for (let index = 0; index < nestedValue.length; index++) {
          elemTypes.add(getTsType(nestedValue[index], kind, optional, interfaceMap, usedNames, `${key}_${index}`));
        }
        const arrayType =
          elemTypes.size === 1 ? [...elemTypes][0] : `(${[...elemTypes].join(' | ')})`;
        entries.push(`  ${formattedKey}${optionalModifier}: ${arrayType}[];`);
      }
      continue;
    }

    const typeName = getTsType(nestedValue, kind, optional, interfaceMap, usedNames, key);
    entries.push(`  ${formattedKey}${optionalModifier}: ${typeName};`);
  }

  if (kind === 'interface') {
    lines.push(`interface ${name} {\n${entries.join('\n')}\n}`);
  } else {
    lines.push(`type ${name} = {\n${entries.join('\n')}\n};`);
  }

  return lines;
}

function buildInterfaceMap(
  value: unknown,
  map: Map<string, string>,
  usedNames: Set<string>,
  keyHint: string,
): void {
  if (value === null || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    const first = value[0];
    if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
      const serialized = JSON.stringify(first);
      if (!map.has(serialized)) {
        const name = generateInterfaceName(keyHint || 'Item', 'Item', usedNames);
        map.set(serialized, name);
        buildInterfaceMap(first, map, usedNames, keyHint || 'Item');
      }
    }
    return;
  }

  const serialized = JSON.stringify(value);
  if (map.has(serialized)) return;

  const name = generateInterfaceName(keyHint || 'Root', 'Root', usedNames);
  map.set(serialized, name);

  const objectValue = value as Record<string, unknown>;
  for (const [key, nestedValue] of Object.entries(objectValue)) {
    if (nestedValue !== null && typeof nestedValue === 'object') {
      buildInterfaceMap(nestedValue, map, usedNames, key);
    }
  }
}

export function jsonToTs(
  input: string,
  kind: TsKind,
  optional: OptionalMode,
): { output: string; error: string | null } {
  try {
    const parsed = JSON.parse(input) as unknown;
    const interfaceMap = new Map<string, string>();
    const usedNames = new Set<string>();

    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      buildInterfaceMap(parsed, interfaceMap, usedNames, 'Root');
    } else if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0];
      if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
        buildInterfaceMap(parsed, interfaceMap, usedNames, 'Item');
      }
    }

    const lines: string[] = [];
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      if (interfaceMap.get(JSON.stringify(parsed))) {
        lines.push(...generateInterfaces(parsed, kind, optional, interfaceMap, usedNames));
      }
    } else if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0];
      if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
        lines.push(...generateInterfaces(first, kind, optional, interfaceMap, usedNames));
      }
    }

    if (lines.length === 0) {
      const rootType =
        parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
          ? (interfaceMap.get(JSON.stringify(parsed)) ?? 'Record<string, unknown>')
          : Array.isArray(parsed) && parsed.length > 0
            ? (() => {
              const first = parsed[0];
              if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
                return (interfaceMap.get(JSON.stringify(first)) ?? 'unknown') + '[]';
              }
              const types = new Set<string>();
              for (const value of parsed) {
                types.add(getTsType(value, kind, optional, interfaceMap, usedNames, ''));
              }
              const resolved = [...types];
              return resolved.length === 1 ? `${resolved[0]}[]` : `(${resolved.join(' | ')})[]`;
            })()
            : getTsType(parsed, kind, optional, interfaceMap, usedNames, 'Root');
      return { output: `type Root = ${rootType};`, error: null };
    }

    return { output: lines.join('\n\n'), error: null };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
}

export function resolveJsonPath(objectValue: unknown, path: string): unknown[] {
  if (!path || path === '$') return [objectValue];

  const parts = path.replace(/^\$\.?/, '').split(/\.|\[(\d+)\]/).filter(Boolean);
  let current: unknown[] = [objectValue];

  for (const part of parts) {
    const next: unknown[] = [];
    for (const item of current) {
      if (item && typeof item === 'object') {
        const key = /^\d+$/.test(part) ? Number(part) : part;
        const value = (item as Record<string | number, unknown>)[key];
        if (value !== undefined) next.push(value);
      }
    }
    current = next;
  }

  return current;
}
