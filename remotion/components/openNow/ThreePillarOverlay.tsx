// Three-pillar overlay matching the flyer body block:
// - Heart in teal circle: "Warm, qualified staff"
// - Star in red circle: "Full-spectrum programs"
// - Sparkle in gold circle: "Nourished and active"
// Each pillar enters in sequence over Sarah VO so the visual beat lands with
// the corresponding spoken line.

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { OPEN_NOW_COLORS, OPEN_NOW_FONTS } from './colors';

interface PillarProps {
  index: number;
  icon: 'heart' | 'star' | 'sparkle';
  iconColor: string;
  bg: string;
  title: string;
  body: string;
  delayFrames: number;
}

const PillarIcon: React.FC<{ kind: PillarProps['icon']; size: number; color: string }> = ({
  kind,
  size,
  color,
}) => {
  const stroke = 0;
  if (kind === 'heart') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          strokeWidth={stroke}
        />
      </svg>
    );
  }
  if (kind === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2l2.9 6.9L22 9.6l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.6L2 9.6l7.1-0.7L12 2z" />
      </svg>
    );
  }
  // sparkle
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2 L13.5 9 L20 10 L13.5 11 L12 18 L10.5 11 L4 10 L10.5 9 Z" />
      <circle cx="19" cy="5" r="1.5" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
};

const Pillar: React.FC<PillarProps> = ({ index, icon, iconColor, bg, title, body, delayFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delayFrames);
  const enter = spring({ frame: local, fps, config: { damping: 12, stiffness: 100 }, durationInFrames: 18 });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [40, 0]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 28,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
        }}
      >
        <PillarIcon kind={icon} size={104} color={iconColor} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 18px' }}>
        <div
          style={{
            fontFamily: OPEN_NOW_FONTS.body,
            fontSize: 36,
            fontWeight: 800,
            color: OPEN_NOW_COLORS.dark,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: OPEN_NOW_FONTS.body,
            fontSize: 26,
            color: OPEN_NOW_COLORS.midGrey,
            lineHeight: 1.4,
          }}
        >
          {body}
        </div>
      </div>
      <div
        style={{
          fontFamily: OPEN_NOW_FONTS.body,
          fontSize: 22,
          fontWeight: 700,
          color: iconColor,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>
    </div>
  );
};

export const ThreePillarOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: OPEN_NOW_COLORS.cream,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
        gap: 40,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: OPEN_NOW_FONTS.body,
            fontSize: 22,
            letterSpacing: '0.3em',
            color: OPEN_NOW_COLORS.teal,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Why families choose us
        </div>
        <div
          style={{
            fontFamily: OPEN_NOW_FONTS.script,
            fontSize: 56,
            color: OPEN_NOW_COLORS.teal,
            marginTop: 4,
          }}
        >
          Where learning and growth become one
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 56, width: '100%' }}>
        <Pillar
          index={0}
          icon="heart"
          iconColor={OPEN_NOW_COLORS.white}
          bg={OPEN_NOW_COLORS.teal}
          title="Warm, qualified staff"
          body="Every child known by name. Every family part of ours."
          delayFrames={0}
        />
        <Pillar
          index={1}
          icon="star"
          iconColor={OPEN_NOW_COLORS.white}
          bg={OPEN_NOW_COLORS.red}
          title="Full-spectrum programs"
          body="Infants, toddlers, and preschoolers. Licensed by Minnesota DCYF."
          delayFrames={50}
        />
        <Pillar
          index={2}
          icon="sparkle"
          iconColor={OPEN_NOW_COLORS.white}
          bg={OPEN_NOW_COLORS.gold}
          title="Nourished and active"
          body="Nutritious meals. Outdoor playgrounds. Indoor active play."
          delayFrames={100}
        />
      </div>
    </AbsoluteFill>
  );
};
