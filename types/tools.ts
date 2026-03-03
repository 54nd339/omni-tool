export type ToolCategory =
  | 'image-studio'
  | 'files-media'
  | 'crypto'
  | 'dev-utils'
  | 'generators';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  path: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  fullWidth?: boolean;
  hideSnippets?: boolean;
}

export interface ToolCategoryDefinition {
  id: ToolCategory;
  name: string;
  description: string;
  path: string;
  icon: string;
  prefetches?: string[];
}
