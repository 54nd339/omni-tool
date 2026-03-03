import { downloadBlob } from '@/lib/utils';

export async function renderMermaidDiagram(params: {
  source: string;
  theme: 'dark' | 'default';
}): Promise<string> {
  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({
    startOnLoad: false,
    theme: params.theme,
    securityLevel: 'loose',
  });

  const { svg } = await mermaid.render('mermaid-preview', params.source);
  return svg;
}

export function exportDiagramSvg(svgOutput: string): void {
  const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
  downloadBlob(blob, 'diagram.svg');
}

export async function exportDiagramPng(params: {
  backgroundColor: string;
  svgOutput: string;
}): Promise<void> {
  const svgBlob = new Blob([params.svgOutput], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);

  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        context.fillStyle = params.backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('PNG export failed'));
            return;
          }

          downloadBlob(blob, 'diagram.png');
          resolve();
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Failed to render SVG image'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
