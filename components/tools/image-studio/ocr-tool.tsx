'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { ScanText, Download } from 'lucide-react';
import { useOcr, useClipboardPaste, useDownload } from '@/hooks';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { CopyButton } from '@/components/shared/copy-button';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LANGUAGES = [
  { id: 'eng', label: 'English' },
  { id: 'spa', label: 'Spanish' },
  { id: 'fra', label: 'French' },
  { id: 'deu', label: 'German' },
  { id: 'por', label: 'Portuguese' },
  { id: 'ita', label: 'Italian' },
  { id: 'chi_sim', label: 'Chinese (Simplified)' },
  { id: 'jpn', label: 'Japanese' },
  { id: 'kor', label: 'Korean' },
  { id: 'hin', label: 'Hindi' },
  { id: 'ara', label: 'Arabic' },
  { id: 'rus', label: 'Russian' },
] as const;

export function OcrTool() {
  const { recognize, status, progress, error } = useOcr();
  const { download } = useDownload();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [lang, setLang] = useState('eng');

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setImageUrl(URL.createObjectURL(file));
      setText('');

      try {
        const result = await recognize(file, lang);
        setText(result);
        toast.success('Text extracted');
      } catch {
        toast.error(error ?? 'OCR failed');
      }
    },
    [recognize, lang, error],
  );

  useClipboardPaste(handleFiles, !imageUrl);

  const handleReset = useCallback(() => {
    setImageUrl(null);
    setText('');
  }, []);

  const handleDownloadTxt = useCallback(() => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    download(blob, 'extracted-text.txt');
  }, [text, download]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {imageUrl && (
          <Button variant="outline" onClick={handleReset}>
            New image
          </Button>
        )}
      </div>

      {!imageUrl && (
        <EmptyState
          icon={ScanText}
          title="Extract text from images"
          description="Upload an image to extract text using OCR"
          hint="Tip: Ctrl+V to paste an image from clipboard"
        >
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'] }}
            label="Drop an image to extract text"
            hint="PNG, JPG, WebP, BMP, or TIFF"
          />
        </EmptyState>
      )}

      {(status === 'loading' || status === 'processing') && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {status === 'loading'
              ? 'Loading OCR engine (first time may take a moment)...'
              : `Recognizing text... ${progress}%`}
          </p>
          <Progress value={status === 'loading' ? undefined : progress} />
        </div>
      )}

      {imageUrl && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Uploaded"
              className="h-auto max-h-[400px] w-full object-contain"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Extracted text</p>
              <div className="flex items-center gap-2">
                {text && <CopyButton value={text} size="sm" />}
                {text && (
                  <Button variant="ghost" size="sm" onClick={handleDownloadTxt}>
                    <Download className="mr-1 h-3 w-3" />
                    .txt
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              value={text}
              readOnly
              rows={16}
              placeholder={status === 'idle' ? 'Extracted text will appear here...' : ''}
              className="font-mono text-sm resize-none bg-muted/50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
