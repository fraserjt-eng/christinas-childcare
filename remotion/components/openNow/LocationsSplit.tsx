// Locations card for scene 5. Mirrors the flyer footer band: teal background,
// gold section labels, white addresses + phone numbers. Stacks the two
// locations vertically because the format is portrait 9:16, then "Two
// locations, one family" tagline anchors the bottom.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { OPEN_NOW_COLORS, OPEN_NOW_FONTS } from './colors';

const LocationBlock: React.FC<{
  label: string;
  line1: string;
  line2: string;
  line3: string;
  delay: number;
}> = ({ label, line1, line2, line3, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);
  const enter = spring({ frame: local, fps, config: { damping: 12, stiffness: 90 }, durationInFrames: 18 });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateX = interpolate(enter, [0, 1], [-40, 0]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <span
        style={{
          fontFamily: OPEN_NOW_FONTS.body,
          fontSize: 26,
          letterSpacing: '0.28em',
          color: OPEN_NOW_COLORS.gold,
          fontWeight: 800,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: OPEN_NOW_FONTS.body,
          fontSize: 44,
          color: OPEN_NOW_COLORS.white,
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {line1}
      </span>
      <span
        style={{
          fontFamily: OPEN_NOW_FONTS.body,
          fontSize: 32,
          color: 'rgba(255,255,255,0.92)',
        }}
      >
        {line2}
      </span>
      <span
        style={{
          fontFamily: OPEN_NOW_FONTS.body,
          fontSize: 36,
          color: OPEN_NOW_COLORS.white,
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}
      >
        {line3}
      </span>
    </div>
  );
};

export const LocationsSplit: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: OPEN_NOW_COLORS.teal,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '90px 80px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span
          style={{
            fontFamily: OPEN_NOW_FONTS.body,
            fontSize: 24,
            letterSpacing: '0.28em',
            color: OPEN_NOW_COLORS.gold,
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          Crystal · Brooklyn Park
        </span>
        <span
          style={{
            fontFamily: OPEN_NOW_FONTS.script,
            fontSize: 64,
            color: OPEN_NOW_COLORS.white,
            lineHeight: 1.1,
          }}
        >
          Two locations,
          <br />
          one family.
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
        <LocationBlock
          label="Crystal"
          line1="5510 W Broadway Ave"
          line2="Open + Enrolling"
          line3="(763) 390-5870"
          delay={0}
        />
        <LocationBlock
          label="Brooklyn Park"
          line1="Now Enrolling"
          line2="Second location · 2026"
          line3="(763) 450-8638"
          delay={28}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: OPEN_NOW_FONTS.body,
            fontSize: 22,
            letterSpacing: '0.24em',
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Licensed · MN DCYF
        </span>
        <span
          style={{
            fontFamily: OPEN_NOW_FONTS.body,
            fontSize: 22,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          christinas-childcare.vercel.app
        </span>
      </div>
    </AbsoluteFill>
  );
};
