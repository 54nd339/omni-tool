'use client';

import { Bookmark } from 'lucide-react';

import { SavedPresetPopover } from '@/components/shared/presets/saved-preset-popover';
import { Button } from '@/components/ui/button';
import { useBookmarkButton } from '@/hooks/use-bookmark-button';

interface BookmarkButtonProps {
  toolId: string;
}

export function BookmarkButton({ toolId }: BookmarkButtonProps) {
  const {
    handleDelete,
    handleLoad,
    handleSave,
    name,
    open,
    saveDisabled,
    savePlaceholder,
    setName,
    setOpen,
    toolBookmarks,
  } = useBookmarkButton(toolId);

  return (
    <SavedPresetPopover
      open={open}
      onOpenChange={setOpen}
      title="Saved bookmarks"
      subtitle="Bookmark current state"
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Bookmarks"
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      }
      items={toolBookmarks}
      emptyText="No bookmarks yet"
      saveName={name}
      onSaveNameChange={setName}
      savePlaceholder={savePlaceholder}
      onSave={handleSave}
      saveDisabled={saveDisabled}
      onLoad={handleLoad}
      onDelete={handleDelete}
      getDeleteAriaLabel={(bookmark) => `Delete ${bookmark.name}`}
    />
  );
}
