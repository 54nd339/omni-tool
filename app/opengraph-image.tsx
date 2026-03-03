import { ImageResponse } from 'next/og';

import { LogoIcon } from '@/components/layout/logo';
import { THEME_COLORS } from '@/lib/constants/image-studio';

export const dynamic = 'force-static';
export const alt = 'OmniTool — Offline-First Toolbox';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ROOT_STYLE = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: THEME_COLORS.dark,
  fontFamily: 'system-ui, sans-serif',
} as const;

const TITLE_STYLE = {
  marginTop: 32,
  fontSize: 56,
  fontWeight: 700,
  color: THEME_COLORS.light,
  letterSpacing: '-0.03em',
} as const;

const SUBTITLE_STYLE = {
  marginTop: 12,
  fontSize: 24,
  color: THEME_COLORS.mutedText,
  letterSpacing: '-0.01em',
} as const;

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={ROOT_STYLE}>
        <LogoIcon
          width="80"
          height="80"
          withBackground
          bgColor={THEME_COLORS.darkMuted}
          strokeColor={THEME_COLORS.light}
          fillColor={THEME_COLORS.light}
        />
        <div style={TITLE_STYLE}>
          OmniTool
        </div>
        <div style={SUBTITLE_STYLE}>
          Offline-first toolbox for images, PDFs, media & more
        </div>
      </div>
    ),
    { ...size },
  );
}
