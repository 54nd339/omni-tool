'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Download,ScanText } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { ProcessingProgress } from '@/components/shared/processing-progress';
import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useClipboardPaste } from '@/hooks/use-clipboard-paste';
import { useOcr } from '@/hooks/worker-hooks';
import { OCR_LANGUAGES } from '@/lib/constants/image-studio';
import { downloadBlob } from '@/lib/utils';

export function OcrTool() {
  const { recognize, status, progress, error } = useOcr();
  const download = downloadBlob;

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
            {OCR_LANGUAGES.map((l) => (
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
        <ProcessingProgress
          label={status === 'loading' ? 'Loading OCR engine (first time may take a moment)...' : 'Recognizing text...'}
          progress={status === 'loading' ? undefined : progress}
        />
      )}

      {imageUrl && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative h-[400px] overflow-hidden rounded-md border border-border">
            <Image
              src={imageUrl}
              alt="Uploaded"
              fill
              unoptimized
              className="object-contain"
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
