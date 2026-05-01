// Subtle "Open Now" lockup that floats over the avatar talking-head clip in
// the first 3 seconds. Doesn't compete with the speaker — sits as a chip in
// the corner. The bigger Open Now lockup lives in CtaEndCard.tsx.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { OPEN_NOW_COLORS, OPEN_NOW_FONTS } from './colors';
import { ZLogo } from './ZLogo';

export const HookCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 110 }, durationInFrames: 14 });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-24, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: OPEN_NOW_COLORS.cream,
          padding: '16px 28px 16px 16px',
          borderRadius: 999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        <ZLogo size={56} compact />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span
            style={{
              fontFamily: OPEN_NOW_FONTS.body,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: OPEN_NOW_COLORS.teal,
              textTransform: 'uppercase',
            }}
          >
            Now Enrolling
          </span>
          <span
            style={{
              fontFamily: OPEN_NOW_FONTS.display,
              fontSize: 32,
              color: OPEN_NOW_COLORS.dark,
            }}
          >
            Open <span style={{ color: OPEN_NOW_COLORS.red }}>Now</span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
