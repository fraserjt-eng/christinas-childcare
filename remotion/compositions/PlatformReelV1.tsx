import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

// Platform Reel v1 — "Which Director Are You?"
// 35 seconds, 1050 frames at 30fps, 1080x1920.
// Rich illustrated scenes built with layered SVG + CSS shapes.
// Background music loaded from public/platform-reel/music.mp3.
// Swap any MP3 into that path to replace the placeholder track.

const BRAND_RED = '#C62828';
const BRAND_RED_DARK = '#c44536';
const CREAM = '#f5f0e8';
const CREAM_DEEP = '#ece4d4';
const GOLD = '#FFD54F';
const GOLD_DEEP = '#f4b84c';
const BLUE = '#2196F3';
const GREEN = '#4CAF50';
const CORAL = '#FF7043';
const DARK = '#1a1a1a';
const MID = '#4a4a4a';
const MUTED = '#6b6b6b';

const DISPLAY_FONT = 'Fredoka One, Nunito, sans-serif';
const BODY_FONT = 'Nunito, Open Sans, sans-serif';

// ─── Shared helpers ──────────────────────────────────────────────────────────

function fadeUp(frame: number, start: number, distance = 40) {
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

function Caption({ children, bottom = 220 }: { children: React.ReactNode; bottom?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        left: 60,
        right: 60,
        textAlign: 'center',
        color: 'white',
        fontFamily: BODY_FONT,
        fontSize: 42,
        fontWeight: 700,
        lineHeight: 1.25,
        padding: '18px 24px',
        background: 'rgba(0, 0, 0, 0.75)',
        borderRadius: 18,
      }}
    >
      {children}
    </div>
  );
}

// Flying paper shape
function Paper({
  x,
  y,
  rotate,
  color = 'white',
  width = 120,
  height = 150,
}: {
  x: number;
  y: number;
  rotate: number;
  color?: string;
  width?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        background: color,
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
        borderRadius: 6,
        padding: 8,
      }}
    >
      <div style={{ height: 6, background: '#e5e0d8', borderRadius: 3, marginBottom: 6 }} />
      <div style={{ height: 4, background: '#efe9de', borderRadius: 2, marginBottom: 4, width: '80%' }} />
      <div style={{ height: 4, background: '#efe9de', borderRadius: 2, marginBottom: 4, width: '90%' }} />
      <div style={{ height: 4, background: '#efe9de', borderRadius: 2, marginBottom: 4, width: '60%' }} />
      <div style={{ height: 4, background: '#efe9de', borderRadius: 2, marginBottom: 4, width: '75%' }} />
      <div style={{ height: 4, background: '#efe9de', borderRadius: 2, width: '55%' }} />
    </div>
  );
}

// Simple cartoon director avatar (top-down view, no real face)
function DirectorAvatar({
  size = 220,
  calm = false,
}: {
  size?: number;
  calm?: boolean;
}) {
  const accent = calm ? GREEN : BRAND_RED;
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Hair bun */}
      <div
        style={{
          position: 'absolute',
          top: size * 0.05,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size * 0.3,
          height: size * 0.25,
          background: '#3c2a1e',
          borderRadius: '50%',
          zIndex: 3,
        }}
      />
      {/* Face */}
      <div
        style={{
          position: 'absolute',
          top: size * 0.16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size * 0.55,
          height: size * 0.55,
          background: '#c89b7b',
          borderRadius: '50%',
          zIndex: 2,
          boxShadow: 'inset 0 -8px 12px rgba(0,0,0,0.08)',
        }}
      >
        {/* Eyes */}
        <div
          style={{
            position: 'absolute',
            top: '42%',
            left: '28%',
            width: 8,
            height: calm ? 3 : 8,
            background: DARK,
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '42%',
            right: '28%',
            width: 8,
            height: calm ? 3 : 8,
            background: DARK,
            borderRadius: '50%',
          }}
        />
        {/* Mouth */}
        <div
          style={{
            position: 'absolute',
            bottom: '28%',
            left: '50%',
            transform: `translateX(-50%) ${calm ? 'rotate(0deg)' : 'rotate(180deg)'}`,
            width: 22,
            height: 10,
            borderBottom: `3px solid ${DARK}`,
            borderRadius: '50%',
          }}
        />
      </div>
      {/* Cardigan / body */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size * 0.8,
          height: size * 0.42,
          background: accent,
          borderRadius: '50% 50% 10% 10% / 30% 30% 10% 10%',
          zIndex: 1,
        }}
      />
      {/* Collar */}
      <div
        style={{
          position: 'absolute',
          bottom: size * 0.32,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size * 0.25,
          height: size * 0.1,
          background: '#fdfaf3',
          borderRadius: 6,
          zIndex: 2,
        }}
      />
    </div>
  );
}

// ─── Scene 1: Hook (0s - 2s, 60 frames) ──────────────────────────────────────

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleBounce = spring({ frame: frame - 6, fps, config: { damping: 10, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: CREAM }}>
      {/* Soft decorative circles */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 420, height: 420, borderRadius: '50%', background: `${BRAND_RED}0f` }} />
      <div style={{ position: 'absolute', bottom: -160, left: -160, width: 500, height: 500, borderRadius: '50%', background: `${GOLD}22` }} />

      {/* Scattered papers behind title */}
      {[
        { x: 120, y: 1180, rotate: -18 },
        { x: 820, y: 1240, rotate: 22 },
        { x: 200, y: 1420, rotate: 8 },
        { x: 760, y: 1480, rotate: -12 },
      ].map((p, i) => (
        <Paper key={i} x={p.x} y={p.y} rotate={p.rotate} />
      ))}

      {/* Comic title */}
      <div
        style={{
          position: 'absolute',
          top: 320,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: titleOpacity,
          transform: `scale(${interpolate(titleBounce, [0, 1], [0.7, 1])})`,
        }}
      >
        <div
          style={{
            background: GOLD,
            padding: '40px 56px',
            borderRadius: 24,
            transform: 'rotate(-2deg)',
            boxShadow: `10px 10px 0 ${BRAND_RED}25, 0 20px 40px rgba(0,0,0,0.12)`,
            border: `4px solid ${DARK}`,
            maxWidth: 900,
          }}
        >
          <p
            style={{
              fontFamily: BODY_FONT,
              fontSize: 22,
              color: BRAND_RED,
              margin: '0 0 12px',
              fontWeight: 800,
              letterSpacing: 3,
              textAlign: 'center',
            }}
          >
            CHILD CARE OWNERS
          </p>
          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 82,
              color: DARK,
              margin: 0,
              lineHeight: 1.0,
              textAlign: 'center',
              letterSpacing: -1,
            }}
          >
            WHICH DIRECTOR ARE YOU?
          </h1>
        </div>
      </div>

      {/* Director avatar in chaos */}
      <div
        style={{
          position: 'absolute',
          top: 900,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: interpolate(frame, [20, 38], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <DirectorAvatar size={300} calm={false} />
      </div>

      {/* Coffee spill */}
      <div
        style={{
          position: 'absolute',
          top: 1180,
          left: 620,
          width: 130,
          height: 60,
          background: '#6b3410',
          borderRadius: '50%',
          opacity: interpolate(frame, [26, 44], [0, 0.85], { extrapolateRight: 'clamp' }),
          filter: 'blur(1px)',
        }}
      />

      <Caption>Which kind of director are you?</Caption>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Pain (2s - 5s, 90 frames) ──────────────────────────────────────

const PainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bubbleSpring = spring({ frame, fps, config: { damping: 12, stiffness: 90 } });
  const subFade = fadeUp(frame, 26, 30);

  // Chaotic shaking of the whole pain stage
  const shake = Math.sin(frame / 2) * 4 * (frame < 40 ? 1 : 0.3);

  return (
    <AbsoluteFill style={{ background: CREAM }}>
      {/* Radial burst behind */}
      <div
        style={{
          position: 'absolute',
          top: 400,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1100,
          height: 1100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND_RED}15 0%, transparent 60%)`,
        }}
      />

      {/* Thought bubble */}
      <div
        style={{
          position: 'absolute',
          top: 380,
          left: '50%',
          transform: `translateX(calc(-50% + ${shake}px)) scale(${interpolate(bubbleSpring, [0, 1], [0.6, 1])})`,
          opacity: interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <div
          style={{
            background: 'white',
            border: `5px solid ${DARK}`,
            borderRadius: 220,
            padding: '44px 72px',
            fontFamily: DISPLAY_FONT,
            fontSize: 66,
            color: DARK,
            boxShadow: `10px 10px 0 ${BRAND_RED}22`,
            textAlign: 'center',
            maxWidth: 840,
          }}
        >
          Drowning in admin work
        </div>
        {/* Bubble dots */}
        <div style={{ position: 'absolute', left: '18%', top: 'calc(100% + 14px)', width: 40, height: 40, borderRadius: '50%', background: 'white', border: `5px solid ${DARK}` }} />
        <div style={{ position: 'absolute', left: '12%', top: 'calc(100% + 70px)', width: 22, height: 22, borderRadius: '50%', background: 'white', border: `4px solid ${DARK}` }} />
      </div>

      {/* Director avatar with chaos elements */}
      <div
        style={{
          position: 'absolute',
          top: 960,
          left: '50%',
          transform: `translateX(calc(-50% + ${shake * 0.6}px))`,
        }}
      >
        <DirectorAvatar size={260} calm={false} />
      </div>

      {/* Papers flying around */}
      {[
        { x: 80, y: 900, rotate: -25, delay: 10 },
        { x: 880, y: 940, rotate: 30, delay: 20 },
        { x: 150, y: 1300, rotate: 12, delay: 30 },
        { x: 820, y: 1260, rotate: -18, delay: 40 },
        { x: 440, y: 1550, rotate: 8, delay: 50 },
      ].map((p, i) => {
        const appear = interpolate(frame, [p.delay, p.delay + 14], [0, 1], {
          extrapolateRight: 'clamp',
        });
        const float = Math.sin((frame + i * 10) / 8) * 12;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y + float,
              opacity: appear,
              transform: `rotate(${p.rotate + Math.sin((frame + i * 5) / 10) * 4}deg)`,
            }}
          >
            <Paper x={0} y={0} rotate={0} width={130} height={165} />
          </div>
        );
      })}

      {/* Red caption */}
      <div
        style={{
          ...subFade,
          position: 'absolute',
          top: 1680,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: BODY_FONT,
          fontSize: 40,
          color: BRAND_RED,
          fontWeight: 800,
        }}
      >
        Running on coffee and adrenaline
      </div>

      <Caption>Losing hours to paperwork?</Caption>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Alternative (5s - 8s, 90 frames) ───────────────────────────────

const AlternativeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const textStyle = fadeUp(frame, 0, 50);
  const calmOpacity = interpolate(frame, [18, 45], [0, 1], { extrapolateRight: 'clamp' });
  const gridAppear = interpolate(frame, [30, 60], [40, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${CREAM} 0%, #ffffff 60%, #ffffff 100%)`,
      }}
    >
      {/* Text */}
      <div
        style={{
          ...textStyle,
          position: 'absolute',
          top: 260,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 80px',
        }}
      >
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 30,
            color: MUTED,
            margin: '0 0 16px',
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          Or
        </p>
        <h2
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 88,
            color: DARK,
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          the one with a <span style={{ color: BRAND_RED }}>system?</span>
        </h2>
      </div>

      {/* Calm director */}
      <div
        style={{
          position: 'absolute',
          top: 720,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: calmOpacity,
        }}
      >
        <DirectorAvatar size={240} calm={true} />
      </div>

      {/* Mini schedule grid mockup */}
      <div
        style={{
          position: 'absolute',
          top: 1080,
          left: 80,
          right: 80,
          opacity: calmOpacity,
          transform: `translateY(${gridAppear}px)`,
          background: 'white',
          borderRadius: 24,
          border: `3px solid ${CREAM_DEEP}`,
          padding: 28,
          boxShadow: '0 18px 40px rgba(26,26,26,0.10)',
        }}
      >
        <p style={{ fontFamily: BODY_FONT, fontSize: 22, color: MUTED, margin: '0 0 16px', fontWeight: 700 }}>
          Today's coverage
        </p>
        {['Infants · 1:4', 'Toddlers · 1:5', 'Preschool · 1:8', 'School-age · 1:12'].map((row, i) => (
          <div
            key={row}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              background: i % 2 === 0 ? CREAM : 'white',
              borderRadius: 12,
              marginBottom: 10,
              opacity: interpolate(frame, [35 + i * 4, 45 + i * 4], [0, 1], { extrapolateRight: 'clamp' }),
              transform: `translateX(${interpolate(frame, [35 + i * 4, 45 + i * 4], [30, 0], { extrapolateRight: 'clamp' })}px)`,
            }}
          >
            <span style={{ fontFamily: BODY_FONT, fontSize: 28, fontWeight: 700, color: DARK }}>{row}</span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: BODY_FONT,
                fontSize: 26,
                color: GREEN,
                fontWeight: 800,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: GREEN,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                ✓
              </span>
              Covered
            </span>
          </div>
        ))}
      </div>

      <Caption>Or the one with a system?</Caption>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Brand card (8s - 13s, 150 frames) ──────────────────────────────

const BrandCardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardSpring = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  const cardStyle = {
    opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
    transform: `scale(${interpolate(cardSpring, [0, 1], [0.7, 1])}) rotate(${interpolate(frame, [0, 30], [-6, 0], { extrapolateRight: 'clamp' })}deg)`,
  };
  const taglineStyle = fadeUp(frame, 40, 30);

  return (
    <AbsoluteFill style={{ background: CREAM, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: -120, right: -120, width: 420, height: 420, borderRadius: '50%', background: `${BRAND_RED}10` }} />
      <div style={{ position: 'absolute', bottom: -120, left: -120, width: 500, height: 500, borderRadius: '50%', background: `${GOLD}22` }} />

      <div
        style={{
          ...cardStyle,
          width: 860,
          background: 'white',
          borderRadius: 36,
          padding: '56px 48px',
          boxShadow: `12px 12px 0 ${BRAND_RED}28, 0 24px 48px rgba(26,26,26,0.10)`,
          border: `3px solid ${BRAND_RED}`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_RED_DARK})`,
            margin: '0 auto 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: DISPLAY_FONT,
            fontSize: 110,
            color: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.14)',
          }}
        >
          CF
        </div>
        <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 68, color: DARK, margin: '0 0 10px' }}>
          Christina's Platform
        </h3>
        <p style={{ fontFamily: BODY_FONT, fontSize: 32, color: MID, margin: '0 0 6px', fontWeight: 800 }}>
          Christina Fraser
        </p>
        <p style={{ fontFamily: BODY_FONT, fontSize: 26, color: MUTED, margin: 0 }}>
          Director &amp; Founder · Crystal, MN · 20+ years
        </p>
      </div>

      <div
        style={{
          ...taglineStyle,
          marginTop: 48,
          padding: '18px 36px',
          background: BRAND_RED,
          borderRadius: 999,
          fontFamily: BODY_FONT,
          fontSize: 32,
          color: 'white',
          fontWeight: 800,
          letterSpacing: 1,
          boxShadow: '0 10px 24px rgba(198,40,40,0.35)',
        }}
      >
        Built by a director. For directors.
      </div>

      <Caption bottom={200}>I built the system I wished I had.</Caption>
    </AbsoluteFill>
  );
};

// ─── Scene: Feature tile wrapper ─────────────────────────────────────────────

type FeatureProps = {
  tag: string;
  title: string;
  subtitle: string;
  accent: string;
  caption: string;
  children: React.ReactNode;
};

const FeatureScene: React.FC<FeatureProps> = ({ tag, title, subtitle, accent, caption, children }) => {
  const frame = useCurrentFrame();
  const header = fadeUp(frame, 0, 30);
  const mockupStyle = fadeUp(frame, 15, 50);

  return (
    <AbsoluteFill style={{ background: CREAM, padding: '120px 60px 160px' }}>
      <div style={{ ...header, textAlign: 'center', marginBottom: 40 }}>
        <div
          style={{
            display: 'inline-block',
            background: accent,
            color: 'white',
            padding: '10px 24px',
            borderRadius: 999,
            fontFamily: BODY_FONT,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          {tag}
        </div>
        <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 68, color: DARK, margin: '0 0 8px', lineHeight: 1 }}>
          {title}
        </h2>
        <p style={{ fontFamily: BODY_FONT, fontSize: 30, color: MUTED, margin: 0, fontWeight: 600 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ ...mockupStyle, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>

      <Caption bottom={140}>{caption}</Caption>
    </AbsoluteFill>
  );
};

// ─── Scene 5: Scheduling feature (13s - 16s, 90 frames) ──────────────────────

const ScheduleFeatureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const dragX = interpolate(frame, [30, 60], [0, 180], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dragY = interpolate(frame, [30, 60], [0, -40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dragOpacity = interpolate(frame, [28, 35, 62, 68], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const staff = [
    { name: 'Maria', color: '#0891b2', shifts: ['7-3', '7-3', '—', '9-5', '7-3'] },
    { name: 'James', color: '#7c3aed', shifts: ['9-5', '—', '7-3', '7-3', '9-5'] },
    { name: 'Priya', color: '#16a34a', shifts: ['—', '7-3', '9-5', '7-3', '—'] },
    { name: 'Devon', color: '#b45309', shifts: ['7-3', '9-5', '7-3', '—', '7-3'] },
  ];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <FeatureScene
      tag="Scheduling"
      title="Staffs itself."
      subtitle="Drag shifts. Ratios check live."
      accent={BLUE}
      caption="Scheduling that covers every classroom."
    >
      <div
        style={{
          background: 'white',
          borderRadius: 28,
          padding: 32,
          boxShadow: '0 24px 48px rgba(26,26,26,0.12)',
          width: '95%',
          position: 'relative',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '130px repeat(5, 1fr)', marginBottom: 14 }}>
          <div style={{ fontFamily: BODY_FONT, fontSize: 22, color: MUTED, fontWeight: 700 }}>Staff</div>
          {days.map((d) => (
            <div key={d} style={{ fontFamily: BODY_FONT, fontSize: 22, color: DARK, fontWeight: 800, textAlign: 'center' }}>
              {d}
            </div>
          ))}
        </div>
        {staff.map((s, si) => (
          <div
            key={s.name}
            style={{ display: 'grid', gridTemplateColumns: '130px repeat(5, 1fr)', alignItems: 'center', padding: '14px 0', borderTop: `1px solid ${CREAM_DEEP}` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: s.color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: BODY_FONT,
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                {s.name[0]}
              </div>
              <span style={{ fontFamily: BODY_FONT, fontSize: 22, color: DARK, fontWeight: 700 }}>{s.name}</span>
            </div>
            {s.shifts.map((shift, di) => {
              const isDragged = si === 0 && di === 2;
              return (
                <div
                  key={di}
                  style={{
                    padding: '0 6px',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      borderRadius: 10,
                      background: isDragged ? 'transparent' : shift === '—' ? CREAM : `${s.color}22`,
                      color: shift === '—' ? MUTED : DARK,
                      fontFamily: BODY_FONT,
                      fontSize: 20,
                      fontWeight: 800,
                      textAlign: 'center',
                      border: isDragged ? `3px dashed ${s.color}` : 'none',
                      minHeight: 42,
                    }}
                  >
                    {isDragged ? '' : shift}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Dragged block */}
        <div
          style={{
            position: 'absolute',
            top: 160,
            left: 380,
            transform: `translate(${dragX}px, ${dragY}px)`,
            opacity: dragOpacity,
            background: staff[0].color,
            color: 'white',
            padding: '10px 26px',
            borderRadius: 10,
            fontFamily: BODY_FONT,
            fontSize: 22,
            fontWeight: 800,
            boxShadow: '0 10px 26px rgba(0,0,0,0.22)',
          }}
        >
          7-3
        </div>
      </div>
    </FeatureScene>
  );
};

// ─── Scene 6: Communications feature (16s - 19s, 90 frames) ──────────────────

const CommunicationsFeatureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const messages = [
    { who: 'You', text: 'Emma had a big morning on the climber!', me: true, delay: 10, color: BRAND_RED },
    { who: 'Parent', text: '😍 so proud of her. Thanks Christina.', me: false, delay: 30 },
    { who: 'You', text: 'Photo attached · Read ✓', me: true, delay: 50, color: BRAND_RED },
  ];

  return (
    <FeatureScene
      tag="Family Communication"
      title="Photos, messages, reads."
      subtitle="Parents see it. You see they saw it."
      accent={CORAL}
      caption="One inbox. Every family. Zero confusion."
    >
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: 48,
          padding: '28px 18px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
          width: 580,
          height: 980,
          position: 'relative',
          border: `12px solid #0a0a0a`,
        }}
      >
        <div style={{ background: CREAM, borderRadius: 24, height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: `2px solid ${CREAM_DEEP}` }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: BRAND_RED,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: DISPLAY_FONT,
                fontSize: 26,
              }}
            >
              CF
            </div>
            <div>
              <p style={{ fontFamily: BODY_FONT, fontSize: 22, color: DARK, margin: 0, fontWeight: 800 }}>Emma's Classroom</p>
              <p style={{ fontFamily: BODY_FONT, fontSize: 16, color: MUTED, margin: 0 }}>Teacher Christina</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
            {messages.map((m, i) => {
              const appear = interpolate(frame, [m.delay, m.delay + 14], [0, 1], { extrapolateRight: 'clamp' });
              const slide = interpolate(frame, [m.delay, m.delay + 14], [30, 0], { extrapolateRight: 'clamp' });
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: m.me ? 'flex-end' : 'flex-start',
                    maxWidth: '78%',
                    background: m.me ? (m.color ?? BRAND_RED) : 'white',
                    color: m.me ? 'white' : DARK,
                    fontFamily: BODY_FONT,
                    fontSize: 22,
                    fontWeight: 600,
                    padding: '16px 20px',
                    borderRadius: 22,
                    borderBottomRightRadius: m.me ? 6 : 22,
                    borderBottomLeftRadius: m.me ? 22 : 6,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    opacity: appear,
                    transform: `translateY(${slide}px)`,
                  }}
                >
                  {m.text}
                </div>
              );
            })}
          </div>

          {/* Photo stub */}
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              opacity: interpolate(frame, [45, 65], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${GOLD}, ${CORAL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📷</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: BODY_FONT, fontSize: 18, color: DARK, margin: 0, fontWeight: 700 }}>Daily photo uploaded</p>
              <p style={{ fontFamily: BODY_FONT, fontSize: 14, color: MUTED, margin: 0 }}>3 families viewed · 1 reacted</p>
            </div>
            <span style={{ fontSize: 26 }}>❤️</span>
          </div>
        </div>
      </div>
    </FeatureScene>
  );
};

// ─── Scene 7: CACFP feature (19s - 22s, 90 frames) ───────────────────────────

const CacfpFeatureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { label: 'Breakfast · Infants', count: '6 of 6', checked: 8 },
    { label: 'Breakfast · Toddlers', count: '10 of 10', checked: 20 },
    { label: 'AM Snack · Preschool', count: '14 of 14', checked: 34 },
    { label: 'Lunch · All classrooms', count: '32 of 32', checked: 52 },
    { label: 'PM Snack · All', count: '30 of 30', checked: 70 },
  ];

  return (
    <FeatureScene
      tag="CACFP &amp; Compliance"
      title="Audit-ready every day."
      subtitle="Meal counts. Menus. Licensing. One screen."
      accent={GREEN}
      caption="Every meal logged. Every inspector happy."
    >
      <div
        style={{
          background: 'white',
          borderRadius: 28,
          padding: 36,
          boxShadow: '0 24px 48px rgba(26,26,26,0.12)',
          width: '95%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <p style={{ fontFamily: BODY_FONT, fontSize: 22, color: MUTED, margin: 0, fontWeight: 700 }}>Today's meal counts</p>
            <p style={{ fontFamily: DISPLAY_FONT, fontSize: 42, color: DARK, margin: 0 }}>Friday · April 19</p>
          </div>
          <div
            style={{
              background: `${GREEN}15`,
              color: GREEN,
              padding: '14px 24px',
              borderRadius: 999,
              fontFamily: BODY_FONT,
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            ✓ CACFP ready
          </div>
        </div>

        {rows.map((r, i) => {
          const appear = interpolate(frame, [r.checked, r.checked + 14], [0, 1], { extrapolateRight: 'clamp' });
          return (
            <div
              key={r.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '22px 24px',
                background: i % 2 === 0 ? CREAM : 'white',
                borderRadius: 14,
                marginBottom: 10,
                opacity: interpolate(frame, [i * 4, i * 4 + 14], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              <span style={{ fontFamily: BODY_FONT, fontSize: 24, color: DARK, fontWeight: 700 }}>{r.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <span style={{ fontFamily: BODY_FONT, fontSize: 22, color: MID }}>{r.count}</span>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: GREEN,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: BODY_FONT,
                    fontSize: 22,
                    fontWeight: 900,
                    opacity: appear,
                    transform: `scale(${interpolate(appear, [0, 1], [0.4, 1])})`,
                  }}
                >
                  ✓
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FeatureScene>
  );
};

// ─── Scene 8: Enrollment feature (22s - 25s, 90 frames) ──────────────────────

const EnrollmentFeatureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const stages = [
    { name: 'Inquiry', count: 8, color: BLUE },
    { name: 'Toured', count: 5, color: CORAL },
    { name: 'Applied', count: 3, color: GOLD_DEEP },
    { name: 'Enrolled', count: 2, color: GREEN },
  ];

  return (
    <FeatureScene
      tag="Enrollment"
      title="Fill the seats."
      subtitle="Tour requests, follow-ups, conversions."
      accent={GOLD_DEEP}
      caption="A pipeline you can actually see."
    >
      <div
        style={{
          background: 'white',
          borderRadius: 28,
          padding: 36,
          boxShadow: '0 24px 48px rgba(26,26,26,0.12)',
          width: '95%',
        }}
      >
        <p style={{ fontFamily: BODY_FONT, fontSize: 22, color: MUTED, margin: '0 0 8px', fontWeight: 700 }}>
          This week's pipeline
        </p>
        <p style={{ fontFamily: DISPLAY_FONT, fontSize: 44, color: DARK, margin: '0 0 32px' }}>18 active families</p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {stages.map((s, i) => {
            const heightTarget = 120 + s.count * 40;
            const grown = interpolate(frame, [i * 6, i * 6 + 20], [24, heightTarget], {
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={s.name}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    height: grown,
                    width: '100%',
                    background: `linear-gradient(180deg, ${s.color}, ${s.color}cc)`,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: 18,
                    fontFamily: DISPLAY_FONT,
                    fontSize: 56,
                    color: 'white',
                    boxShadow: `0 10px 24px ${s.color}44`,
                  }}
                >
                  {s.count}
                </div>
                <div style={{ fontFamily: BODY_FONT, fontSize: 22, color: DARK, fontWeight: 800 }}>{s.name}</div>
              </div>
            );
          })}
        </div>

        {/* Auto follow-up callout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: `${GOLD}33`,
            borderRadius: 14,
            padding: 22,
            opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: GOLD_DEEP,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: DISPLAY_FONT,
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            ✉
          </div>
          <div>
            <p style={{ fontFamily: BODY_FONT, fontSize: 22, color: DARK, margin: '0 0 2px', fontWeight: 800 }}>
              3 tour follow-ups sent today
            </p>
            <p style={{ fontFamily: BODY_FONT, fontSize: 18, color: MUTED, margin: 0 }}>
              Automated after 48 hours. No more seats sitting empty.
            </p>
          </div>
        </div>
      </div>
    </FeatureScene>
  );
};

// ─── Scene 9: Outcomes (25s - 30s, 150 frames) ───────────────────────────────

const OutcomesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = [
    { text: 'Scheduling that staffs itself.', accent: BLUE, icon: '🗓' },
    { text: 'A tour flow that fills classrooms.', accent: GOLD_DEEP, icon: '🚀' },
    { text: 'Admin that stops eating your week.', accent: GREEN, icon: '🕑' },
  ];

  const headerStyle = fadeUp(frame, 0, 30);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${CREAM} 0%, #ffffff 60%, ${CREAM} 100%)`,
        padding: '200px 80px 100px',
      }}
    >
      <div style={{ ...headerStyle, textAlign: 'center', marginBottom: 60 }}>
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 26,
            color: BRAND_RED,
            margin: '0 0 12px',
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          What you get
        </p>
        <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 78, color: DARK, margin: 0, lineHeight: 1.05 }}>
          Your week back.
        </h2>
      </div>

      <div style={{ width: '100%' }}>
        {lines.map((line, i) => {
          const delay = 20 + i * 22;
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
              key={line.text}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                marginBottom: 32,
                background: 'white',
                borderLeft: `10px solid ${line.accent}`,
                padding: '32px 36px',
                borderRadius: 20,
                boxShadow: '0 10px 30px rgba(26,26,26,0.10)',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: `${line.accent}22`,
                  fontSize: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {line.icon}
              </div>
              <p
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: 44,
                  fontWeight: 800,
                  color: DARK,
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                {line.text}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 10: Closing (30s - 35s, 150 frames) ───────────────────────────────

const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardSpring = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  const urlFade = fadeUp(frame, 20, 30);
  const ctaFade = fadeUp(frame, 40, 30);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${DARK} 0%, #2a1a1a 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 60px',
      }}
    >
      <div
        style={{
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_RED_DARK})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: DISPLAY_FONT,
          fontSize: 120,
          color: 'white',
          boxShadow: '0 20px 60px rgba(198,40,40,0.4)',
          marginBottom: 40,
          transform: `scale(${interpolate(cardSpring, [0, 1], [0.7, 1])})`,
        }}
      >
        CF
      </div>

      <h2
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: 76,
          color: 'white',
          margin: '0 0 20px',
          textAlign: 'center',
          lineHeight: 1.05,
        }}
      >
        Come see how I run mine.
      </h2>

      <div
        style={{
          ...urlFade,
          background: 'white',
          padding: '24px 40px',
          borderRadius: 24,
          marginBottom: 40,
          boxShadow: `0 10px 40px ${BRAND_RED}55`,
          border: `4px solid ${GOLD}`,
        }}
      >
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 22,
            color: MUTED,
            margin: '0 0 6px',
            letterSpacing: 3,
            textTransform: 'uppercase',
            fontWeight: 800,
            textAlign: 'center',
          }}
        >
          See the platform
        </p>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 44,
            color: BRAND_RED,
            margin: 0,
            letterSpacing: -0.5,
            textAlign: 'center',
          }}
        >
          christinas-childcare.vercel.app/platform
        </p>
      </div>

      <div
        style={{
          ...ctaFade,
          background: BRAND_RED,
          color: 'white',
          padding: '20px 44px',
          borderRadius: 999,
          fontFamily: BODY_FONT,
          fontSize: 32,
          fontWeight: 800,
          boxShadow: '0 14px 30px rgba(198,40,40,0.45)',
        }}
      >
        Book a 20-minute walkthrough
      </div>

      <p
        style={{
          position: 'absolute',
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: BODY_FONT,
          fontSize: 22,
          color: 'rgba(255,255,255,0.5)',
          margin: 0,
          letterSpacing: 1,
        }}
      >
        Crystal, Minnesota · Licensed by Minnesota DCYF
      </p>
    </AbsoluteFill>
  );
};

// ─── Root composition ────────────────────────────────────────────────────────

export const PlatformReelV1: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Audio src={staticFile('platform-reel/music.mp3')} volume={0.55} />

      <Sequence from={0} durationInFrames={60}>
        <HookScene />
      </Sequence>
      <Sequence from={60} durationInFrames={90}>
        <PainScene />
      </Sequence>
      <Sequence from={150} durationInFrames={90}>
        <AlternativeScene />
      </Sequence>
      <Sequence from={240} durationInFrames={150}>
        <BrandCardScene />
      </Sequence>
      <Sequence from={390} durationInFrames={90}>
        <ScheduleFeatureScene />
      </Sequence>
      <Sequence from={480} durationInFrames={90}>
        <CommunicationsFeatureScene />
      </Sequence>
      <Sequence from={570} durationInFrames={90}>
        <CacfpFeatureScene />
      </Sequence>
      <Sequence from={660} durationInFrames={90}>
        <EnrollmentFeatureScene />
      </Sequence>
      <Sequence from={750} durationInFrames={150}>
        <OutcomesScene />
      </Sequence>
      <Sequence from={900} durationInFrames={150}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
