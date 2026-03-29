import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import type { RecordedSegment } from '@/types/video-schema';

interface ElementHighlightProps {
  segments: RecordedSegment[];
  contentStartFrame: number;
  primaryColor: string;
}

export const ElementHighlight: React.FC<ElementHighlightProps> = ({
  segments,
  contentStartFrame,
  primaryColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const contentFrame = frame - contentStartFrame;
  if (contentFrame < 0) return null;

  const currentTimeMs = (contentFrame / fps) * 1000;

  // Find active segment
  let current: RecordedSegment | null = null;
  for (const seg of segments) {
    if (currentTimeMs >= seg.startTimeMs && currentTimeMs < seg.endTimeMs) {
      current = seg;
      break;
    }
  }

  if (!current || !current.element.found || !current.element.boundingBox) return null;

  const box = current.element.boundingBox;
  const segmentStartFrame = Math.round((current.startTimeMs / 1000) * fps);
  const localFrame = contentFrame - segmentStartFrame;
  const segmentDurationFrames = Math.round(((current.endTimeMs - current.startTimeMs) / 1000) * fps);

  // Spring scale-in
  const scaleProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Fade out at end
  const opacity = interpolate(
    localFrame,
    [0, 10, segmentDurationFrames - 10, segmentDurationFrames],
    [0, 0.8, 0.8, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Subtle pulse
  const pulse = 1 + Math.sin(localFrame * 0.15) * 0.02;
  const padding = 8;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: box.x - padding,
          top: box.y - padding,
          width: box.width + padding * 2,
          height: box.height + padding * 2,
          border: `2px solid ${primaryColor}`,
          borderRadius: 8,
          boxShadow: `0 0 20px ${primaryColor}66, inset 0 0 20px ${primaryColor}11`,
          opacity: opacity * scaleProgress,
          transform: `scale(${pulse})`,
          transformOrigin: 'center',
        }}
      />
    </AbsoluteFill>
  );
};
