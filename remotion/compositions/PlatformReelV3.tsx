import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

// Platform Reel v3 — Documentary cinematic. 60 seconds, 1800 frames at 30fps, 1080x1920.
// Real footage throughout: before/after WordPress to platform, real feature videos,
// real center photography, ElevenLabs narration, layered ambient score.
// Maps to FlowState /build page's before/after transformation narrative.

const BRAND_RED = '#C62828';
const BRAND_RED_DARK = '#c44536';
const CREAM = '#f5f0e8';
const CREAM_DEEP = '#ece4d4';
const GOLD = '#FFD54F';
const BLUE = '#2196F3';
const GREEN = '#4CAF50';
const CORAL = '#FF7043';
const DARK = '#1a1a1a';
const MID = '#4a4a4a';
const MUTED = '#6b6b6b';

const DISPLAY_FONT = 'Fredoka One, Nunito, sans-serif';
const BODY_FONT = 'Nunito, Open Sans, sans-serif';

const file = (p: string) => staticFile(`platform-reel/${p}`);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fadeIn(frame: number, start: number, dur = 18) {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

function fadeInOut(frame: number, totalFrames: number, hold = 12) {
  const inOp = interpolate(frame, [0, hold], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outOp = interpolate(frame, [totalFrames - hold, totalFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.min(inOp, outOp);
}

function Caption({
  children,
  bottom = 240,
  color = 'white',
  bg = 'rgba(0,0,0,0.78)',
}: {
  children: React.ReactNode;
  bottom?: number;
  color?: string;
  bg?: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        left: 60,
        right: 60,
        textAlign: 'center',
        color,
        fontFamily: BODY_FONT,
        fontSize: 44,
        fontWeight: 800,
        lineHeight: 1.2,
        padding: '20px 28px',
        background: bg,
        borderRadius: 18,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </div>
  );
}

// Full-bleed image / video layer with optional Ken Burns pan-zoom
function CinematicImg({
  src,
  frame,
  totalFrames,
  zoom = 1.08,
  panX = 0,
  panY = 0,
  grade = 'warm',
}: {
  src: string;
  frame: number;
  totalFrames: number;
  zoom?: number;
  panX?: number;
  panY?: number;
  grade?: 'warm' | 'cool' | 'vivid' | 'neutral';
}) {
  const progress = frame / totalFrames;
  const scale = interpolate(progress, [0, 1], [1, zoom]);
  const tx = interpolate(progress, [0, 1], [0, panX]);
  const ty = interpolate(progress, [0, 1], [0, panY]);
  const grades: Record<string, string> = {
    warm: 'saturate(1.05) brightness(0.98) sepia(0.18) hue-rotate(-5deg)',
    cool: 'saturate(0.6) brightness(0.85) contrast(1.02) sepia(0.1) hue-rotate(185deg)',
    vivid: 'saturate(1.15) brightness(1.02) contrast(1.05)',
    neutral: 'none',
  };
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
        filter: grades[grade],
      }}
    >
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}

function Vignette() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)',
      }}
    />
  );
}

// ─── Scene 1: Cold open on old WordPress home (0-5s, 150 frames) ─────────────

const Scene1OldHome: React.FC = () => {
  const frame = useCurrentFrame();
  const labelOpacity = fadeIn(frame, 18);
  const fadeOut = interpolate(frame, [130, 150], [1, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: DARK, opacity: fadeOut }}>
      <CinematicImg src={file('before-after/christina-before-home.png')} frame={frame} totalFrames={150} zoom={1.14} panY={-20} grade="cool" />
      <Vignette />
      <div
        style={{
          position: 'absolute',
          top: 240,
          left: 60,
          right: 60,
          textAlign: 'center',
          opacity: labelOpacity,
        }}
      >
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 24,
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: 6,
            textTransform: 'uppercase',
            margin: '0 0 12px',
            fontWeight: 800,
          }}
        >
          Before
        </p>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 58,
            color: 'white',
            margin: 0,
            letterSpacing: -0.5,
            textShadow: '0 4px 16px rgba(0,0,0,0.6)',
          }}
        >
          2020. Crystal, Minnesota.
        </p>
      </div>
      <Caption bottom={260}>I opened a center.</Caption>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Old About + Programs (5-9s, 120 frames) ────────────────────────

const Scene2OldPages: React.FC = () => {
  const frame = useCurrentFrame();
  // Swap between two screenshots midway
  const showSecond = frame >= 60;
  const src = showSecond ? file('before-after/christina-before-programs.png') : file('before-after/christina-before-about.png');
  // Local frame for each half so Ken Burns restarts
  const localFrame = showSecond ? frame - 60 : frame;
  const localTotal = 60;
  const fadeAtSwap = showSecond ? interpolate(frame, [60, 68], [0, 1], { extrapolateRight: 'clamp' }) : 1;
  return (
    <AbsoluteFill style={{ background: DARK }}>
      <div style={{ opacity: fadeAtSwap }}>
        <CinematicImg src={src} frame={localFrame} totalFrames={localTotal} zoom={1.1} panX={showSecond ? 20 : -20} grade="cool" />
      </div>
      <Vignette />
      <Caption bottom={240}>Ran it from a page like this.</Caption>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Montage of real center photos (9-14s, 150 frames) ──────────────

const Scene3CenterLife: React.FC = () => {
  const frame = useCurrentFrame();
  const photos = [
    { src: file('center-kids.jpg'), grade: 'warm' as const, zoom: 1.1, panY: -10 },
    { src: staticFile('images/community.png'), grade: 'warm' as const, zoom: 1.08, panX: 15 },
    { src: staticFile('images/van.png'), grade: 'warm' as const, zoom: 1.12, panY: 10 },
  ];
  const slotFrames = 50; // 3 slots × 50 = 150
  const slotIndex = Math.min(photos.length - 1, Math.floor(frame / slotFrames));
  const localFrame = frame - slotIndex * slotFrames;
  const photo = photos[slotIndex];
  const fadeSlot = fadeInOut(localFrame, slotFrames, 10);
  return (
    <AbsoluteFill style={{ background: DARK }}>
      <div style={{ opacity: fadeSlot }}>
        <CinematicImg src={photo.src} frame={localFrame} totalFrames={slotFrames} zoom={photo.zoom} panX={photo.panX ?? 0} panY={photo.panY ?? 0} grade={photo.grade} />
      </div>
      <Vignette />
      <Caption bottom={240}>Tired of spreadsheets and three-ring binders.</Caption>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Transition — old fades into new platform hero (14-19s, 150 frames) ─

const Scene4Transition: React.FC = () => {
  const frame = useCurrentFrame();
  // Old fades out over 0-60, new fades in 40-100, hold 100-150
  const oldOpacity = interpolate(frame, [0, 60], [1, 0], { extrapolateRight: 'clamp' });
  const newOpacity = interpolate(frame, [40, 100], [0, 1], { extrapolateRight: 'clamp' });
  const flashOpacity = interpolate(frame, [45, 60, 75], [0, 0.35, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelOpacity = fadeIn(frame, 105);

  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <div style={{ opacity: oldOpacity, position: 'absolute', inset: 0 }}>
        <CinematicImg src={file('before-after/christina-before-home.png')} frame={frame} totalFrames={150} zoom={1.16} grade="cool" />
      </div>
      <div style={{ opacity: newOpacity, position: 'absolute', inset: 0 }}>
        <CinematicImg src={file('before-after/christina-after-home.png')} frame={frame - 40} totalFrames={110} zoom={1.1} grade="vivid" />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'white', opacity: flashOpacity }} />

      <div
        style={{
          position: 'absolute',
          top: 280,
          left: 60,
          right: 60,
          textAlign: 'center',
          opacity: labelOpacity,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: BRAND_RED,
            color: 'white',
            padding: '14px 36px',
            borderRadius: 999,
            fontFamily: BODY_FONT,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 20,
            boxShadow: `0 10px 28px ${BRAND_RED}55`,
          }}
        >
          After
        </div>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 100,
            color: DARK,
            margin: 0,
            lineHeight: 0.95,
            letterSpacing: -1,
          }}
        >
          So I built this.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: Stat bar (19-24s, 150 frames) ──────────────────────────────────

const Scene5Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const headerFade = fadeIn(frame, 0);

  const stats = [
    { label: 'Role-Based Portals', target: 3, suffix: '', delay: 15, accent: BLUE },
    { label: 'Operational Tools', target: 20, suffix: '+', delay: 35, accent: GREEN },
    { label: 'Pages Built', target: 96, suffix: '', delay: 55, accent: CORAL },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${CREAM} 0%, #ffffff 100%)`,
      }}
    >
      <div
        style={{
          opacity: headerFade,
          position: 'absolute',
          top: 280,
          left: 60,
          right: 60,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 24,
            color: BRAND_RED,
            margin: '0 0 12px',
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          What I built
        </p>
        <h2
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 72,
            color: DARK,
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          One system. One center.
        </h2>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 620,
          left: 60,
          right: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: 30,
        }}
      >
        {stats.map((s) => {
          const progress = interpolate(frame, [s.delay, s.delay + 35], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const count = Math.round(progress * s.target);
          const cardOpacity = fadeIn(frame, s.delay - 5, 18);
          const cardY = interpolate(frame, [s.delay - 5, s.delay + 15], [40, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={s.label}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                background: 'white',
                borderRadius: 24,
                padding: '32px 40px',
                display: 'flex',
                alignItems: 'center',
                gap: 32,
                boxShadow: '0 16px 40px rgba(26,26,26,0.10)',
                borderLeft: `10px solid ${s.accent}`,
              }}
            >
              <p
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontSize: 120,
                  color: s.accent,
                  margin: 0,
                  lineHeight: 1,
                  minWidth: 220,
                }}
              >
                {count}
                {progress >= 1 ? s.suffix : ''}
              </p>
              <p
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: 38,
                  color: DARK,
                  margin: 0,
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 6: Feature montage A (24-33s, 270 frames) ─────────────────────────

type FeatureSlot = { clip: string; label: string; accent: string; caption: string };

const FeatureMontage: React.FC<{ slots: FeatureSlot[] }> = ({ slots }) => {
  const frame = useCurrentFrame();
  const slotFrames = Math.floor(270 / slots.length);
  const slotIdx = Math.min(slots.length - 1, Math.floor(frame / slotFrames));
  const localFrame = frame - slotIdx * slotFrames;
  const slot = slots[slotIdx];
  const labelOpacity = fadeIn(localFrame, 6);
  const labelY = interpolate(localFrame, [6, 24], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const clipOpacity = fadeInOut(localFrame, slotFrames, 8);

  return (
    <AbsoluteFill style={{ background: DARK }}>
      <div style={{ position: 'absolute', inset: 0, opacity: clipOpacity }}>
        <OffthreadVideo src={file(`features/${slot.clip}.mp4`)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {/* top gradient for label legibility */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 420,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, transparent 100%)',
          opacity: clipOpacity,
        }}
      />
      {/* bottom gradient */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 480,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.82) 0%, transparent 100%)',
          opacity: clipOpacity,
        }}
      />

      {/* Label */}
      <div
        style={{
          position: 'absolute',
          top: 180,
          left: 60,
          right: 60,
          textAlign: 'center',
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: slot.accent,
            color: 'white',
            padding: '14px 32px',
            borderRadius: 999,
            fontFamily: BODY_FONT,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: 'uppercase',
            boxShadow: `0 8px 20px ${slot.accent}55`,
          }}
        >
          {slot.label}
        </div>
      </div>

      <Caption bottom={220}>{slot.caption}</Caption>
    </AbsoluteFill>
  );
};

// ─── Scene 8: Christina / Built by a director (42-50s, 240 frames) ──────────

const Scene8BuiltBy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const imgSpring = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  const imgScale = interpolate(imgSpring, [0, 1], [0.9, 1]);
  const cardOpacity = fadeIn(frame, 20, 20);
  const taglineOpacity = fadeIn(frame, 60, 20);

  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <CinematicImg src={file('center-family.jpg')} frame={frame} totalFrames={240} zoom={1.1} panX={10} grade="warm" />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(245,240,232,0.35) 0%, rgba(245,240,232,0.85) 70%, rgba(245,240,232,0.95) 100%)` }} />

      <div
        style={{
          position: 'absolute',
          top: 780,
          left: 60,
          right: 60,
          opacity: cardOpacity,
          transform: `scale(${imgScale})`,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 26,
            color: BRAND_RED,
            margin: '0 0 16px',
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          Christina Fraser
        </p>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 100,
            color: DARK,
            margin: 0,
            lineHeight: 0.95,
          }}
        >
          Built by a director.
        </p>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 100,
            color: BRAND_RED,
            margin: 0,
            lineHeight: 0.95,
          }}
        >
          For directors.
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 160,
          left: 60,
          right: 60,
          textAlign: 'center',
          opacity: taglineOpacity,
        }}
      >
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 30,
            color: MID,
            margin: 0,
            fontStyle: 'italic',
            fontWeight: 600,
          }}
        >
          Crystal, Minnesota · Licensed MN DCYF · Twenty years operating.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 9: Live /platform scroll (50-55s, 150 frames) ─────────────────────

const Scene9PlatformScroll: React.FC = () => {
  const frame = useCurrentFrame();
  const labelOpacity = fadeIn(frame, 10);
  return (
    <AbsoluteFill style={{ background: DARK }}>
      <OffthreadVideo src={file('feature-platform-scroll.mp4')} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 60,
          right: 60,
          opacity: labelOpacity,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.95)',
            color: BRAND_RED,
            padding: '14px 36px',
            borderRadius: 999,
            fontFamily: BODY_FONT,
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: 'uppercase',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          Live · Running today
        </div>
      </div>
      <Caption bottom={280}>Come see how I run mine.</Caption>
    </AbsoluteFill>
  );
};

// ─── Scene 10: Closing URL + CTA (55-60s, 150 frames) ────────────────────────

const Scene10Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoSpring = spring({ frame, fps, config: { damping: 12, stiffness: 90 } });
  const urlOpacity = fadeIn(frame, 20, 22);
  const ctaOpacity = fadeIn(frame, 45, 22);
  const locationOpacity = fadeIn(frame, 70, 22);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${DARK} 0%, #2a1a1a 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 60px',
      }}
    >
      {/* Decorative red ring */}
      <div
        style={{
          position: 'absolute',
          top: 180,
          left: '50%',
          transform: `translateX(-50%) scale(${interpolate(logoSpring, [0, 1], [0.7, 1])})`,
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
          boxShadow: `0 20px 60px ${BRAND_RED}77`,
        }}
      >
        CF
      </div>

      <h2
        style={{
          position: 'absolute',
          top: 520,
          left: 60,
          right: 60,
          fontFamily: DISPLAY_FONT,
          fontSize: 74,
          color: 'white',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.05,
          opacity: fadeIn(frame, 8),
        }}
      >
        Come see how I run mine.
      </h2>

      <div
        style={{
          position: 'absolute',
          top: 820,
          left: 60,
          right: 60,
          background: 'white',
          padding: '28px 40px',
          borderRadius: 24,
          boxShadow: `0 14px 40px ${BRAND_RED}77`,
          border: `4px solid ${GOLD}`,
          opacity: urlOpacity,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: 22,
            color: MUTED,
            margin: '0 0 8px',
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontWeight: 800,
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
          }}
        >
          christinas-childcare.vercel.app/platform
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 1140,
          left: 60,
          right: 60,
          textAlign: 'center',
          opacity: ctaOpacity,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: BRAND_RED,
            color: 'white',
            padding: '22px 48px',
            borderRadius: 999,
            fontFamily: BODY_FONT,
            fontSize: 32,
            fontWeight: 800,
            boxShadow: `0 14px 36px ${BRAND_RED}66`,
          }}
        >
          Book a 20-minute walkthrough
        </div>
      </div>

      <p
        style={{
          position: 'absolute',
          bottom: 120,
          left: 60,
          right: 60,
          textAlign: 'center',
          fontFamily: BODY_FONT,
          fontSize: 22,
          color: 'rgba(255,255,255,0.55)',
          margin: 0,
          letterSpacing: 2,
          opacity: locationOpacity,
        }}
      >
        Crystal, Minnesota · Licensed by Minnesota DCYF
      </p>
    </AbsoluteFill>
  );
};

// ─── Root composition ────────────────────────────────────────────────────────

export const PlatformReelV3: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: DARK }}>
      {/* Background music under everything */}
      <Audio src={file('music.mp3')} volume={0.52} />

      {/* Voiceover lines, placed at their narrative timestamps */}
      <Sequence from={45} layout="none">
        <Audio src={file('vo/line-01.mp3')} volume={1.0} />
      </Sequence>
      <Sequence from={160} layout="none">
        <Audio src={file('vo/line-02.mp3')} volume={1.0} />
      </Sequence>
      <Sequence from={285} layout="none">
        <Audio src={file('vo/line-03.mp3')} volume={1.0} />
      </Sequence>
      <Sequence from={445} layout="none">
        <Audio src={file('vo/line-04.mp3')} volume={1.0} />
      </Sequence>
      <Sequence from={560} layout="none">
        <Audio src={file('vo/line-05.mp3')} volume={1.0} />
      </Sequence>
      <Sequence from={825} layout="none">
        <Audio src={file('vo/line-06.mp3')} volume={1.0} />
      </Sequence>
      <Sequence from={1035} layout="none">
        <Audio src={file('vo/line-07.mp3')} volume={1.0} />
      </Sequence>
      <Sequence from={1285} layout="none">
        <Audio src={file('vo/line-08.mp3')} volume={1.0} />
      </Sequence>
      <Sequence from={1510} layout="none">
        <Audio src={file('vo/line-09.mp3')} volume={1.0} />
      </Sequence>
      <Sequence from={1655} layout="none">
        <Audio src={file('vo/line-10.mp3')} volume={1.0} />
      </Sequence>

      {/* Visual scenes */}
      <Sequence from={0} durationInFrames={150}>
        <Scene1OldHome />
      </Sequence>
      <Sequence from={150} durationInFrames={120}>
        <Scene2OldPages />
      </Sequence>
      <Sequence from={270} durationInFrames={150}>
        <Scene3CenterLife />
      </Sequence>
      <Sequence from={420} durationInFrames={150}>
        <Scene4Transition />
      </Sequence>
      <Sequence from={570} durationInFrames={150}>
        <Scene5Stats />
      </Sequence>
      <Sequence from={720} durationInFrames={270}>
        <FeatureMontage
          slots={[
            { clip: 'schedule', label: 'Scheduling', accent: BLUE, caption: 'Staffs itself. Every ratio covered.' },
            { clip: 'communication', label: 'Family Communication', accent: CORAL, caption: 'Every photo. Every parent. Read.' },
            { clip: 'compliance', label: 'CACFP & Compliance', accent: GREEN, caption: 'Audit-ready every single day.' },
          ]}
        />
      </Sequence>
      <Sequence from={990} durationInFrames={270}>
        <FeatureMontage
          slots={[
            { clip: 'parent', label: 'Enrollment', accent: GOLD, caption: 'Fill the seats. Follow up automatically.' },
            { clip: 'intel', label: 'Business Intelligence', accent: BLUE, caption: 'What is going well. What is drifting.' },
            { clip: 'employee', label: 'Staff Workflows', accent: CORAL, caption: 'Onboarding, training, time. Done.' },
          ]}
        />
      </Sequence>
      <Sequence from={1260} durationInFrames={240}>
        <Scene8BuiltBy />
      </Sequence>
      <Sequence from={1500} durationInFrames={150}>
        <Scene9PlatformScroll />
      </Sequence>
      <Sequence from={1650} durationInFrames={150}>
        <Scene10Closing />
      </Sequence>
    </AbsoluteFill>
  );
};
