import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface NarrationTextProps {
  text: string;
  position?: 'bottom' | 'top' | 'center';
  style?: 'subtitle' | 'callout' | 'tip';
}

export const NarrationText: React.FC<NarrationTextProps> = ({
  text,
  position = 'bottom',
  style = 'subtitle'
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15, 85, 100], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(frame, [0, 15], [20, 0], { extrapolateRight: 'clamp' });

  const positionStyles: Record<string, React.CSSProperties> = {
    bottom: { bottom: 80, left: 0, right: 0 },
    top: { top: 80, left: 0, right: 0 },
    center: { top: '50%', left: 0, right: 0, transform: 'translateY(-50%)' },
  };

  const styleVariants: Record<string, React.CSSProperties> = {
    subtitle: {
      background: 'rgba(0, 0, 0, 0.85)',
      padding: '20px 40px',
      borderRadius: 12,
      maxWidth: 1400,
    },
    callout: {
      background: 'linear-gradient(135deg, #c44536 0%, #a33527 100%)',
      padding: '24px 48px',
      borderRadius: 16,
      maxWidth: 1000,
      boxShadow: '0 8px 32px rgba(196, 69, 54, 0.4)',
    },
    tip: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      padding: '20px 36px',
      borderRadius: 12,
      maxWidth: 900,
      boxShadow: '0 8px 32px rgba(37, 99, 235, 0.4)',
    },
  };

  return (
    <AbsoluteFill
      style={{
        ...positionStyles[position],
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          ...styleVariants[style],
          opacity,
          transform: `translateY(${y}px)`,
        }}
      >
        <p
          style={{
            fontSize: style === 'callout' ? 36 : 28,
            color: 'white',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.5,
            fontWeight: style === 'callout' ? 600 : 400,
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};
