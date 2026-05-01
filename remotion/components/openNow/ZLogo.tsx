// Z mark used in the flyer top-left and the website navigation. Same SVG
// path as DashboardLayout / KioskBanner so the brand stays one shape across
// surfaces. Sizing is via the `size` prop (rendered SVG is square).

import React from 'react';

interface ZLogoProps {
  size?: number;
  /** When true, drop the small accent dot for tight crops. */
  compact?: boolean;
}

export const ZLogo: React.FC<ZLogoProps> = ({ size = 80, compact = false }) => {
  const id = `zGradOpenNow-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFC107" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="#C44536" />
      <path
        d="M12,10 L28,10 Q30,10 29,12 L17,26 L28,26 Q30,26 30,28 Q30,30 28,30 L12,30 Q10,30 11,28 L23,14 L12,14 Q10,14 10,12 Q10,10 12,10 Z"
        fill={`url(#${id})`}
      />
      {!compact && <circle cx="31" cy="9" r="1.5" fill="#FFE082" opacity="0.9" />}
    </svg>
  );
};
