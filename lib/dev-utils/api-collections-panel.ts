import { createId, downloadJson, readFileText } from '@/lib/utils';
import type { ApiEnvironment, SavedRequest } from '@/stores/api-collections-store';

export function generateCollectionId(): string {
  return createId();
}

export function withRequestId(request: SavedRequest): SavedRequest {
  return { ...request, id: request.id || generateCollectionId() };
}

export function getActiveEnvironmentVariables(
  environments: ApiEnvironment[],
  activeEnvironmentId: string | null,
): Record<string, string> {
  return environments.find((environment) => environment.id === activeEnvironmentId)?.variables ?? {};
}

export function removeVariable(
  variables: Record<string, string>,
  key: string,
): Record<string, string> {
  const next = { ...variables };
  delete next[key];
  return next;
}

export function downloadJsonFile(fileName: string, content: string): void {
  downloadJson(content, fileName);
}

export function readFileAsText(file: File): Promise<string> {
  return readFileText(file, 'Failed to read file');
}
