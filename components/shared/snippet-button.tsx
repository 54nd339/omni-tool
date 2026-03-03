'use client';

import { FileText, Plus } from 'lucide-react';

import { SavedPresetPopover } from '@/components/shared/presets/saved-preset-popover';
import { Button } from '@/components/ui/button';
import { useSnippetButton } from '@/hooks/use-snippet-button';

interface SnippetButtonProps {
  toolId: string;
}

export function SnippetButton({ toolId }: SnippetButtonProps) {
  const {
    allSnippets,
    handleDelete,
    handleLoad,
    handleSave,
    name,
    open,
    saveDisabled,
    setName,
    setOpen,
  } = useSnippetButton(toolId);

  return (
    <SavedPresetPopover
      open={open}
      onOpenChange={setOpen}
      title="Snippets"
      trigger={
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <FileText className="h-3.5 w-3.5" />
          Snippets
          {allSnippets.length > 0 && (
            <span className="ml-0.5 rounded-full bg-muted px-1.5 text-[10px] font-medium">
              {allSnippets.length}
            </span>
          )}
        </Button>
      }
      items={allSnippets}
      emptyText="No snippets yet"
      saveName={name}
      onSaveNameChange={setName}
      savePlaceholder="Snippet name..."
      onSave={handleSave}
      saveDisabled={saveDisabled}
      saveButtonContent={<Plus className="h-3 w-3" />}
      onLoad={handleLoad}
      onDelete={handleDelete}
      canDelete={(snippet) => !snippet.builtIn}
      renderItemSuffix={(snippet) =>
        snippet.builtIn ? (
          <span className="ml-1.5 text-[10px] text-muted-foreground">(built-in)</span>
        ) : null
      }
      getDeleteAriaLabel={(snippet) => `Delete snippet ${snippet.name}`}
    />
  );
}
