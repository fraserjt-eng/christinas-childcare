import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface TitleCardProps {
  title: string;
  subtitle?: string;
  duration?: number;
}

export const TitleCard: React.FC<TitleCardProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });

  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });

  const logoScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 120 }
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 80,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,69,54,0.3) 0%, transparent 70%)',
          transform: `scale(${logoScale})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          right: 100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,69,54,0.2) 0%, transparent 70%)',
          transform: `scale(${logoScale})`,
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 80,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: titleOpacity,
          transform: `scale(${logoScale})`,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            background: '#c44536',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          C
        </div>
        <span style={{ color: 'white', fontSize: 24, fontWeight: 500 }}>
          Christina&apos;s Child Care
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          transform: `translateY(${interpolate(titleY, [0, 1], [50, 0])}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            margin: 0,
            opacity: titleOpacity,
            maxWidth: 1200,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: 32,
              color: '#999',
              textAlign: 'center',
              margin: 0,
              opacity: subtitleOpacity,
              maxWidth: 900,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Training badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: subtitleOpacity,
        }}
      >
        <div
          style={{
            background: '#c44536',
            padding: '12px 24px',
            borderRadius: 8,
            color: 'white',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Staff Training Video
        </div>
      </div>
    </AbsoluteFill>
  );
};
