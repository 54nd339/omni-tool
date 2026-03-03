'use client';

import { SlidersHorizontal } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useImageEditor } from '@/hooks/use-image-editor';

import { CompressModeView } from './compress-mode-view';
import { type ImageEditorContextValue, ImageEditorProvider } from './context';
import { EditModeView } from './edit-mode-view';

export function ImageEditorTool() {
  const editor = useImageEditor();

  return (
    <div className="space-y-6">
      {!editor.file && (
        <EmptyState
          icon={SlidersHorizontal}
          title="Edit or compress an image"
          description="Resize, adjust quality, convert format, or quick-compress"
          hint="Tip: ⌘V to paste an image from clipboard"
        >
          <FileDropzone
            onFiles={editor.handleFiles}
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif'],
            }}
            label="Drop an image"
            hint="Resize, convert, compress -- or paste from clipboard"
          />
        </EmptyState>
      )}

      {editor.file && (
        <>
          <ToggleGroup
            type="single"
            value={editor.mode}
            onValueChange={editor.handleModeChange}
          >
            <ToggleGroupItem value="edit">Resize &amp; Convert</ToggleGroupItem>
            <ToggleGroupItem value="compress">Quick Compress</ToggleGroupItem>
          </ToggleGroup>

          <ImageEditorProvider value={{ ...editor, file: editor.file } satisfies ImageEditorContextValue}>
            {editor.mode === 'edit' ? <EditModeView /> : <CompressModeView />}
          </ImageEditorProvider>
        </>
      )}
    </div>
  );
}
