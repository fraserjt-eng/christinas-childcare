import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { PageTransition as PageTransitionData } from '@/types/video-schema';

interface PageTransitionProps {
  transitions: PageTransitionData[];
  contentStartFrame: number;
}

const CROSSFADE_FRAMES = 15;

export const PageTransitionOverlay: React.FC<PageTransitionProps> = ({
  transitions,
  contentStartFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const contentFrame = frame - contentStartFrame;
  if (contentFrame < 0) return null;

  const currentTimeMs = (contentFrame / fps) * 1000;

  for (const t of transitions) {
    const endMs = t.timeMs + (CROSSFADE_FRAMES / fps) * 1000;
    if (currentTimeMs >= t.timeMs && currentTimeMs < endMs) {
      const progress = (currentTimeMs - t.timeMs) / ((CROSSFADE_FRAMES / fps) * 1000);
      const opacity = interpolate(progress, [0, 0.5, 1], [0, 0.6, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', background: `rgba(0,0,0,${opacity})` }} />
      );
    }
  }
  return null;
};
