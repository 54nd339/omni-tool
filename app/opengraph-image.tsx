import { ImageResponse } from 'next/og';
import { LogoIcon } from '@/components/layout/logo';

export const dynamic = 'force-static';
export const alt = 'OmniTool — Offline-First Toolbox';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <LogoIcon
          width="80"
          height="80"
          withBackground
          bgColor="#27272a"
          strokeColor="#fafafa"
          fillColor="#fafafa"
        />
        <div
          style={{
            marginTop: 32,
            fontSize: 56,
            fontWeight: 700,
            color: '#fafafa',
            letterSpacing: '-0.03em',
          }}
        >
          OmniTool
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 24,
            color: '#a1a1aa',
            letterSpacing: '-0.01em',
          }}
        >
          Offline-first toolbox for images, PDFs, media & more
        </div>
      </div>
    ),
    { ...size },
  );
}
