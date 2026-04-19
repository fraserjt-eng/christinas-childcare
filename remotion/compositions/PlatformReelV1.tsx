import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

// Platform Reel v1 — "Which Director Are You?"
// Text-driven composition. Renders cleanly without external illustrations so the
// ad can be previewed immediately. When illustration assets exist, drop them in at
// video-studio/projects/christinas-childcare/platform-reel/illustrations/ and
// extend each scene with a matching <Img /> layer.

const BRAND_RED = '#C62828';
const CREAM = '#f5f0e8';
const GOLD = '#FFD54F';
const DARK = '#1a1a1a';
const MID = '#4a4a4a';

const DISPLAY_FONT = 'Fredoka One, Nunito, sans-serif';
const BODY_FONT = 'Nunito, Open Sans, sans-serif';

function useFadeUp(frame: number, start: number, distance = 40) {
  const opacity = interpolate(frame, [start, start + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [start, start + 18], [distance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return { opacity, transform: `translateY(${y}px)` };
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 220,
        left: 60,
        right: 60,
        textAlign: 'center',
        color: 'white',
        fontFamily: BODY_FONT,
        fontSize: 42,
        fontWeight: 700,
        lineHeight: 1.25,
        padding: '18px 24px',
        background: 'rgba(0, 0, 0, 0.72)',
        borderRadius: 16,
      }}
    >
      {children}
    </div>
  );
}

// Scene 1: Hook (0:00 - 0:02, 60 frames)
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleStyle = useFadeUp(frame, 0, 40);
  const chaosStyle = useFadeUp(frame, 12, 30);
  const bounce = spring({ frame: frame - 4, fps, config: { damping: 12, stiffness: 80 } });

  return (
    <AbsoluteFill style={{ background: CREAM, justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          ...titleStyle,
          transform: `${titleStyle.transform} scale(${interpolate(bounce, [0, 1], [0.85, 1])})`,
          textAlign: 'center',
          padding: '0 80px',
          maxWidth: 960,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: GOLD,
            padding: '24px 40px',
            borderRadius: 18,
            transform: 'rotate(-2deg)',
            boxShadow: '6px 6px 0 rgba(198,40,40,0.12)',
          }}
        >
          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 88,
              color: DARK,
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            WHICH CHILD CARE DIRECTOR ARE YOU?
          </h1>
        </div>
      </div>

      <div
        style={{
          ...chaosStyle,
          position: 'absolute',
          bottom: 340,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: BODY_FONT,
          fontSize: 36,
          color: MID,
          fontStyle: 'italic',
        }}
      >
        Illustration: director at cluttered desk
      </div>

      <Caption>Which kind of director are you?</Caption>
    </AbsoluteFill>
  );
};

// Scene 2: Pain (0:02 - 0:06, 120 frames)
const PainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const bubbleStyle = useFadeUp(frame, 0, 50);
  const subStyle = useFadeUp(frame, 20, 30);

  return (
    <AbsoluteFill style={{ background: CREAM, justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          ...bubbleStyle,
          background: 'white',
          border: `4px solid ${DARK}`,
          borderRadius: 200,
          padding: '36px 60px',
          fontFamily: DISPLAY_FONT,
          fontSize: 64,
          color: DARK,
          boxShadow: '8px 8px 0 rgba(198,40,40,0.15)',
          maxWidth: 800,
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        Drowning in admin work
      </div>
      <div
        style={{
          ...subStyle,
          fontFamily: BODY_FONT,
          fontSize: 42,
          color: BRAND_RED,
          fontWeight: 700,
          textAlign: 'center',
          padding: '0 80px',
        }}
      >
        Running on coffee and adrenaline
      </div>

      <Caption>Losing hours to paperwork?</Caption>
    </AbsoluteFill>
  );
};

// Scene 3: Alternative (0:06 - 0:10, 120 frames)
const AlternativeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const style = useFadeUp(frame, 0, 50);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${CREAM} 0%, #ffffff 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          ...style,
          textAlign: 'center',
          padding: '0 80px',
          maxWidth: 960,
        }}
      >
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 36,
            color: MID,
            margin: '0 0 24px',
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          Or
        </p>
        <h2
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 96,
            color: DARK,
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          the one with a <span style={{ color: BRAND_RED }}>system?</span>
        </h2>
      </div>

      <Caption>Or the one with a system?</Caption>
    </AbsoluteFill>
  );
};

// Scene 4: Brand card (0:10 - 0:15, 150 frames)
const BrandCardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardSpring = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  const cardStyle = {
    opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
    transform: `scale(${interpolate(cardSpring, [0, 1], [0.7, 1])}) rotate(${interpolate(
      frame,
      [0, 30],
      [-6, 0],
      { extrapolateRight: 'clamp' }
    )}deg)`,
  };

  const taglineStyle = useFadeUp(frame, 40, 30);

  return (
    <AbsoluteFill style={{ background: CREAM, justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          ...cardStyle,
          width: 860,
          background: 'white',
          borderRadius: 36,
          padding: '56px 48px',
          boxShadow: '12px 12px 0 rgba(198,40,40,0.18)',
          border: `3px solid ${BRAND_RED}`,
          textAlign: 'center',
        }}
      >
        {/* Headshot placeholder */}
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${BRAND_RED}, #c44536)`,
            margin: '0 auto 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: DISPLAY_FONT,
            fontSize: 96,
            color: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          CF
        </div>
        <h3
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 64,
            color: DARK,
            margin: '0 0 12px',
          }}
        >
          Christina's Platform
        </h3>
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 30,
            color: MID,
            margin: '0 0 6px',
            fontWeight: 700,
          }}
        >
          Christina Fraser
        </p>
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 26,
            color: MID,
            margin: 0,
          }}
        >
          Director &amp; Founder · Crystal, MN · 20+ years
        </p>
      </div>

      <div
        style={{
          ...taglineStyle,
          marginTop: 48,
          padding: '16px 32px',
          background: BRAND_RED,
          borderRadius: 999,
          fontFamily: BODY_FONT,
          fontSize: 30,
          color: 'white',
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        Built by a director. For directors.
      </div>

      <Caption>I built the system I wished I had.</Caption>
    </AbsoluteFill>
  );
};

// Scene 5: Outcomes + URL (0:15 - 0:20, 150 frames)
const OutcomesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = [
    'Scheduling that staffs itself.',
    'A tour flow that fills classrooms.',
    'Admin that stops eating your week.',
  ];

  const urlStyle = useFadeUp(frame, 90, 30);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${CREAM} 0%, #ffffff 60%, ${CREAM} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 80px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 900 }}>
        {lines.map((line, i) => {
          const delay = 6 + i * 20;
          const opacity = interpolate(frame, [delay, delay + 18], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const y = interpolate(frame, [delay, delay + 18], [40, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={line}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                marginBottom: 28,
                background: 'white',
                borderLeft: `8px solid ${BRAND_RED}`,
                padding: '28px 32px',
                borderRadius: 20,
                boxShadow: '0 6px 24px rgba(26,26,26,0.08)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: `${BRAND_RED}15`,
                  color: BRAND_RED,
                  fontFamily: DISPLAY_FONT,
                  fontSize: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <p
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: 40,
                  fontWeight: 700,
                  color: DARK,
                  margin: 0,
                }}
              >
                {line}
              </p>
            </div>
          );
        })}
      </div>

      <div
        style={{
          ...urlStyle,
          position: 'absolute',
          bottom: 140,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 24,
            color: MID,
            margin: '0 0 8px',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          See the platform
        </p>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 40,
            color: BRAND_RED,
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          christinas-childcare.vercel.app/platform
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const PlatformReelV1: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Sequence from={0} durationInFrames={60}>
        <HookScene />
      </Sequence>
      <Sequence from={60} durationInFrames={120}>
        <PainScene />
      </Sequence>
      <Sequence from={180} durationInFrames={120}>
        <AlternativeScene />
      </Sequence>
      <Sequence from={300} durationInFrames={150}>
        <BrandCardScene />
      </Sequence>
      <Sequence from={450} durationInFrames={150}>
        <OutcomesScene />
      </Sequence>
    </AbsoluteFill>
  );
};
