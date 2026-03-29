import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { WalkthroughManifest } from '@/types/video-schema';

interface ProgressBarProps {
  manifest: WalkthroughManifest;
  contentStartFrame: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  manifest,
  contentStartFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const contentFrame = frame - contentStartFrame;
  if (contentFrame < 0) return null;

  const currentTimeMs = (contentFrame / fps) * 1000;

  // Find current chapter
  let currentChapterIdx = 0;
  for (let i = 0; i < manifest.chapters.length; i++) {
    const ch = manifest.chapters[i];
    if (currentTimeMs >= ch.startTimeMs && currentTimeMs < ch.endTimeMs) {
      currentChapterIdx = i;
      break;
    }
    if (i === manifest.chapters.length - 1) {
      currentChapterIdx = i;
    }
  }

  const currentChapter = manifest.chapters[currentChapterIdx];
  if (!currentChapter) return null;

  // Progress within chapter
  const chapterProgress = Math.min(
    1,
    (currentTimeMs - currentChapter.startTimeMs) /
      (currentChapter.endTimeMs - currentChapter.startTimeMs)
  );

  // Overall progress
  const overallProgress = currentTimeMs / manifest.totalDurationMs;

  // Suppress unused variable warning; chapterProgress is available for future use
  void chapterProgress;

  // Fade in after title card
  const opacity = interpolate(contentFrame, [0, 20], [0, 0.9], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Step counter pill */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
          opacity,
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '8px 16px',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#aaa',
            }}
          >
            Chapter {currentChapterIdx + 1} of {manifest.chapters.length}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'white',
            }}
          >
            {currentChapter.title}
          </span>
        </div>

        {/* Thin progress bar */}
        <div
          style={{
            width: 200,
            height: 3,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${overallProgress * 100}%`,
              height: '100%',
              background: 'rgba(255,255,255,0.8)',
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
