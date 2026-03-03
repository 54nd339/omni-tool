import { type ComponentProps } from 'react';

import { THEME_COLORS } from '@/lib/constants/image-studio';

interface LogoIconProps extends ComponentProps<'svg'> {
  /** Render the rounded-rect background (used in favicons / OG images) */
  withBackground?: boolean;
  bgColor?: string;
  /** Explicit hex colors — when omitted, Tailwind classes are used instead */
  strokeColor?: string;
  fillColor?: string;
}

const HEX_PATH = 'M112 184 L256 112 L400 184 L400 328 L256 400 L112 328Z';
const VERT_PATH = 'M256 112 L256 400';
const DIAG_A = 'M112 184 L400 328';
const DIAG_B = 'M400 184 L112 328';

export function LogoIcon({
  withBackground,
  bgColor = THEME_COLORS.darkElevated,
  strokeColor,
  fillColor,
  ...props
}: LogoIconProps) {
  const sProps = strokeColor
    ? { stroke: strokeColor }
    : { className: 'stroke-background' as string };
  const fProps = fillColor
    ? { fill: fillColor }
    : { className: 'fill-background' as string };

  return (
    <svg
      viewBox={withBackground ? '0 0 512 512' : '70 70 372 372'}
      fill="none"
      {...props}
    >
      {withBackground && (
        <rect width="512" height="512" rx="96" fill={bgColor} />
      )}
      <path d={HEX_PATH} {...sProps} strokeWidth="28" strokeLinejoin="round" />
      <path d={VERT_PATH} {...sProps} strokeWidth="24" strokeLinecap="round" />
      <path d={DIAG_A} {...sProps} strokeWidth="24" strokeLinecap="round" />
      <path d={DIAG_B} {...sProps} strokeWidth="24" strokeLinecap="round" />
      <circle cx="256" cy="256" r="36" {...fProps} />
    </svg>
  );
}
