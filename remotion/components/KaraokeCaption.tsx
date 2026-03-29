import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { RecordedSegment, WordTimestamp } from '@/types/video-schema';

interface KaraokeCaptionProps {
  segments: RecordedSegment[];
  contentStartFrame: number;
}

const WORDS_PER_LINE = 10;
const CAPTION_FONT_SIZE = 28;

export const KaraokeCaption: React.FC<KaraokeCaptionProps> = ({
  segments,
  contentStartFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const contentFrame = frame - contentStartFrame;
  if (contentFrame < 0) return null;

  const currentTimeMs = (contentFrame / fps) * 1000;

  // Find active segment
  let activeSegment: RecordedSegment | null = null;
  for (const seg of segments) {
    if (currentTimeMs >= seg.startTimeMs && currentTimeMs < seg.endTimeMs) {
      activeSegment = seg;
      break;
    }
  }

  if (!activeSegment || activeSegment.wordTimestamps.length === 0) return null;

  const segmentLocalTimeS = (currentTimeMs - activeSegment.startTimeMs) / 1000;
  const segStartFrame = Math.round((activeSegment.startTimeMs / 1000) * fps);
  const localFrame = contentFrame - segStartFrame;
  const segDurationFrames = Math.round(((activeSegment.endTimeMs - activeSegment.startTimeMs) / 1000) * fps);

  // Fade in/out
  const containerOpacity = interpolate(
    localFrame,
    [0, 10, segDurationFrames - 10, segDurationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Split words into lines
  const words = activeSegment.wordTimestamps;
  const lines: WordTimestamp[][] = [];
  for (let i = 0; i < words.length; i += WORDS_PER_LINE) {
    lines.push(words.slice(i, i + WORDS_PER_LINE));
  }

  // Find which line to show (the one containing the current word)
  let currentLineIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const lastWord = lines[i][lines[i].length - 1];
    if (segmentLocalTimeS <= lastWord.end) {
      currentLineIdx = i;
      break;
    }
    if (i === lines.length - 1) {
      currentLineIdx = i;
    }
  }

  const currentLine = lines[currentLineIdx];
  if (!currentLine) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: containerOpacity,
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            padding: '16px 32px',
            borderRadius: 12,
            maxWidth: 1400,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0 8px',
          }}
        >
          {currentLine.map((w, i) => {
            const isSpoken = segmentLocalTimeS >= w.start;
            const isCurrent =
              segmentLocalTimeS >= w.start &&
              (i === currentLine.length - 1 || segmentLocalTimeS < currentLine[i + 1]?.start);

            return (
              <span
                key={`${currentLineIdx}-${i}`}
                style={{
                  fontSize: CAPTION_FONT_SIZE,
                  fontWeight: isCurrent ? 700 : isSpoken ? 600 : 400,
                  color: isCurrent ? '#ffffff' : isSpoken ? '#e0e0e0' : '#666666',
                  lineHeight: 1.6,
                  transition: 'color 0.1s ease',
                }}
              >
                {w.word}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
