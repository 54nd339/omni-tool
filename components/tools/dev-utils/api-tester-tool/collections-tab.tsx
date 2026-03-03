'use client';

import { FolderPlus, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SavedRequest } from '@/stores/api-collections-store';

interface CollectionItem {
  id: string;
  name: string;
  requests: SavedRequest[];
}

interface CollectionsTabProps {
  collections: CollectionItem[];
  deleteCollection: (collectionId: string) => void;
  deleteRequest: (collectionId: string, requestId: string) => void;
  handleCreateCollection: () => void;
  handleLoad: (request: SavedRequest) => void;
  handleSaveToCollection: (collectionId: string) => void;
  newCollectionName: string;
  setNewCollectionName: (value: string) => void;
}

export function CollectionsTab({
  collections,
  deleteCollection,
  deleteRequest,
  handleCreateCollection,
  handleLoad,
  handleSaveToCollection,
  newCollectionName,
  setNewCollectionName,
}: CollectionsTabProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newCollectionName}
          onChange={(event) => setNewCollectionName(event.target.value)}
          placeholder="New collection..."
          className="h-8 text-xs"
          onKeyDown={(event) => event.key === 'Enter' && handleCreateCollection()}
        />
        <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={handleCreateCollection}>
          <FolderPlus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {collections.length === 0 && (
        <p className="py-2 text-center text-xs text-muted-foreground">No collections yet</p>
      )}

      {collections.map((collection) => (
        <div key={collection.id} className="rounded-md border border-border bg-background p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{collection.name}</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleSaveToCollection(collection.id)}
                title="Save current request"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={() => deleteCollection(collection.id)}
                title="Delete collection"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {collection.requests.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {collection.requests.map((request) => (
                <li key={request.id} className="flex items-center justify-between gap-1 rounded px-1.5 py-0.5 hover:bg-muted">
                  <button
                    className="flex items-center gap-2 text-left text-xs"
                    onClick={() => handleLoad(request)}
                  >
                    <span className="w-12 shrink-0 rounded bg-muted px-1 py-0.5 text-center text-[10px] font-mono font-semibold">
                      {request.method}
                    </span>
                    <span className="truncate">{request.name || request.url}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 text-destructive"
                    onClick={() => deleteRequest(collection.id, request.id)}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
