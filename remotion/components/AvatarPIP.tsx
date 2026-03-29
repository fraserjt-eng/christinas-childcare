import { AbsoluteFill, Video, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface AvatarPIPProps {
  src: string;
  isVideo: boolean;
  startFrame: number;
  endFrame: number;
  size?: number;
}

export const AvatarPIP: React.FC<AvatarPIPProps> = ({
  src,
  isVideo,
  startFrame,
  endFrame,
  size = 200,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const fadeFrames = Math.round(fps * 0.3);
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + fadeFrames, endFrame - fadeFrames, endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        bottom: 32,
        right: 32,
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '3px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.35)',
        opacity,
      }}>
        {isVideo ? (
          <Video src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
    </AbsoluteFill>
  );
};
