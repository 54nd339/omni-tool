import type { Change } from 'diff';

export type DiffMode = 'lines' | 'words' | 'chars' | 'sentences';

export type JsonValidationResult = {
  valid: boolean;
  errors?: string[];
};

export type DiffResult = {
  mode: DiffMode;
  changes: Change[];
};

export type ToolResult = { result: string; error?: undefined } | { result?: undefined; error: string };

export type SchemaValidation = {
  output?: string;
  validation?: JsonValidationResult;
  error?: string;
};
