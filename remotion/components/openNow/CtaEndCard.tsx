// Closing card. Mirrors the flyer body lockup ("Open Now" giant) plus the
// teal footer band ("Come see us · Schedule a tour today") plus the website
// + phone CTA. This is the last 5 seconds; intent is "get on the phone."

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { OPEN_NOW_COLORS, OPEN_NOW_FONTS } from './colors';
import { ZLogo } from './ZLogo';

export const CtaEndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterMain = spring({ frame, fps, config: { damping: 14, stiffness: 110 }, durationInFrames: 22 });
  const enterFooter = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 14, stiffness: 110 },
    durationInFrames: 22,
  });

  const mainOpacity = interpolate(enterMain, [0, 1], [0, 1]);
  const mainScale = interpolate(enterMain, [0, 1], [0.9, 1]);
  const footerOpacity = interpolate(enterFooter, [0, 1], [0, 1]);
  const footerY = interpolate(enterFooter, [0, 1], [80, 0]);

  return (
    <AbsoluteFill
      style={{
        background: OPEN_NOW_COLORS.cream,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '60px 40px 0 40px',
      }}
    >
      {/* Top — Z mark + brand identifier */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          alignSelf: 'flex-start',
          marginLeft: 20,
          opacity: mainOpacity,
        }}
      >
        <ZLogo size={120} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span
            style={{
              fontFamily: OPEN_NOW_FONTS.display,
              fontSize: 56,
              color: OPEN_NOW_COLORS.dark,
            }}
          >
            Christina&apos;s
          </span>
          <span
            style={{
              fontFamily: OPEN_NOW_FONTS.body,
              fontSize: 22,
              letterSpacing: '0.28em',
              color: OPEN_NOW_COLORS.teal,
              fontWeight: 700,
              textTransform: 'uppercase',
              marginTop: 6,
            }}
          >
            Child Care Center
          </span>
        </div>
      </div>

      {/* Center — giant Open Now lockup mirroring the flyer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: mainOpacity,
          transform: `scale(${mainScale})`,
          transformOrigin: 'center',
        }}
      >
        <span
          style={{
            fontFamily: OPEN_NOW_FONTS.body,
            fontSize: 28,
            letterSpacing: '0.32em',
            color: OPEN_NOW_COLORS.teal,
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          Now Enrolling
        </span>
        <div
          style={{
            display: 'flex',
            gap: 24,
            fontFamily: OPEN_NOW_FONTS.display,
            fontSize: 240,
            lineHeight: 1,
          }}
        >
          <span style={{ color: OPEN_NOW_COLORS.dark }}>Open</span>
          <span style={{ color: OPEN_NOW_COLORS.red }}>Now</span>
        </div>
        <div
          style={{
            fontFamily: OPEN_NOW_FONTS.script,
            fontSize: 56,
            color: OPEN_NOW_COLORS.teal,
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <span style={{ width: 80, height: 2, background: OPEN_NOW_COLORS.teal }} />
          Where learning and growth become one
          <span style={{ width: 80, height: 2, background: OPEN_NOW_COLORS.teal }} />
        </div>
      </div>

      {/* Footer band — matches flyer footer */}
      <div
        style={{
          width: '100%',
          background: OPEN_NOW_COLORS.teal,
          padding: '50px 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          opacity: footerOpacity,
          transform: `translateY(${footerY}px)`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span
            style={{
              fontFamily: OPEN_NOW_FONTS.display,
              fontSize: 56,
              color: OPEN_NOW_COLORS.white,
              lineHeight: 1,
            }}
          >
            Come see <span style={{ color: OPEN_NOW_COLORS.gold }}>us</span>
          </span>
          <span
            style={{
              fontFamily: OPEN_NOW_FONTS.script,
              fontSize: 38,
              color: OPEN_NOW_COLORS.gold,
            }}
          >
            Schedule a tour today
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span
            style={{
              fontFamily: OPEN_NOW_FONTS.body,
              fontSize: 20,
              letterSpacing: '0.32em',
              color: OPEN_NOW_COLORS.gold,
              textTransform: 'uppercase',
              fontWeight: 800,
            }}
          >
            Call to tour
          </span>
          <span
            style={{
              fontFamily: OPEN_NOW_FONTS.display,
              fontSize: 64,
              color: OPEN_NOW_COLORS.white,
              letterSpacing: '0.04em',
            }}
          >
            (763) 450-8638
          </span>
          <span
            style={{
              fontFamily: OPEN_NOW_FONTS.body,
              fontSize: 22,
              color: 'rgba(255,255,255,0.85)',
              marginTop: 4,
            }}
          >
            christinas-childcare.vercel.app · Licensed · MN DCYF
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
