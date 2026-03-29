import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';

interface ChapterCardProps {
  title: string;
  subtitle: string;
  chapterIndex: number;
  totalChapters: number;
  primaryColor: string;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  title,
  subtitle,
  chapterIndex,
  totalChapters,
  primaryColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance animation
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  // Exit fade (last 15 frames)
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const numberOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(enterProgress, [0, 1], [40, 0]);
  const titleOpacity = interpolate(enterProgress, [0, 1], [0, 1]);

  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Accent line animation
  const lineWidth = interpolate(frame, [5, 30], [0, 200], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Chapter number */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          opacity: numberOpacity,
          fontSize: 20,
          fontWeight: 500,
          color: primaryColor,
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}
      >
        Chapter {chapterIndex + 1} of {totalChapters}
      </div>

      {/* Accent line */}
      <div
        style={{
          position: 'absolute',
          top: '43%',
          width: lineWidth,
          height: 3,
          background: primaryColor,
          borderRadius: 2,
        }}
      />

      {/* Title */}
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: 'white',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: 'absolute',
          top: '58%',
          opacity: subtitleOpacity,
        }}
      >
        <p
          style={{
            fontSize: 24,
            color: '#888',
            margin: 0,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          {subtitle}
        </p>
      </div>
    </AbsoluteFill>
  );
};
