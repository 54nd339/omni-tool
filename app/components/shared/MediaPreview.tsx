import { FC } from 'react';
import { ControlPanel } from './ControlPanel';
import { MediaPreviewProps } from '@/app/lib/types';

export const MediaPreview: FC<MediaPreviewProps> = ({
  file,
  url,
  type,
  emptyMessage = 'Upload media to preview.',
}) => {
  return (
    <ControlPanel title="Media Preview">
      {url && type ? (
        type === 'video' ? (
          <video
            controls
            src={url}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700"
          />
        ) : (
          <audio controls src={url} className="w-full">
            Your browser does not support the audio element.
          </audio>
        )
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
      )}
    </ControlPanel>
  );
};
