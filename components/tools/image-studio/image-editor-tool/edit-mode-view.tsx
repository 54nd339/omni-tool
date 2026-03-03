import Image from 'next/image';

import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/utils';

import { useImageEditorContext } from './context';
import { ImageEditorActions } from './image-editor-actions';
import { ImageEditorControls } from './image-editor-controls';

export function EditModeView() {
  const {
    canRedo,
    canUndo,
    estimatedSize,
    file,
    format,
    height,
    heightError,
    lockAspect,
    originalDims,
    previewUrl,
    processing,
    progress,
    quality,
    resultBlob,
    width,
    widthError,
    handleDownload,
    handleHeightChange,
    handleProcess,
    handleRedo,
    handleReset,
    handleUndo,
    onShare,
    setFormat,
    setLockAspect,
    setQuality,
    handleWidthChange,
  } = useImageEditorContext();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-2">
        <div className="overflow-hidden rounded-lg border border-border">
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Preview"
              width={1200}
              height={900}
              unoptimized
              className="max-h-[400px] w-full object-contain"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Original: {formatBytes(file.size)}
          {resultBlob && (
            <>
              {' → '}
              {formatBytes(resultBlob.size)}{' '}
              <span className={resultBlob.size < file.size ? 'text-green-600' : 'text-destructive'}>
                ({((1 - resultBlob.size / file.size) * 100).toFixed(1)}% {resultBlob.size < file.size ? 'smaller' : 'larger'})
              </span>
            </>
          )}
        </p>
      </div>

      <div className="space-y-6">
        <ImageEditorControls
          state={{
            estimatedSize,
            format,
            height,
            heightError,
            lockAspect,
            originalDims,
            quality,
            width,
            widthError,
          }}
          actions={{
            onFormatChange: setFormat,
            onHeightChange: handleHeightChange,
            onQualityChange: setQuality,
            onToggleLock: () => setLockAspect((value) => !value),
            onWidthChange: handleWidthChange,
          }}
        />

        {processing && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Processing... {progress}%</p>
            <Progress value={progress} />
          </div>
        )}

        <ImageEditorActions
          processing={processing}
          canUndo={canUndo}
          canRedo={canRedo}
          hasResult={!!resultBlob}
          onProcess={handleProcess}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDownload={handleDownload}
          onShare={onShare}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
