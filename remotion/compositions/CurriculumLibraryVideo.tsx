import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { TitleCard } from '../components/TitleCard';
import { NarrationText } from '../components/NarrationText';
import { MockUI } from '../components/MockUI';

export const CurriculumLibraryVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  // Fast pacing - ~55 seconds total
  return (
    <AbsoluteFill style={{ background: '#1a1a1a' }}>
      {/* Title - 0:00 to 0:04 */}
      <Sequence from={0} durationInFrames={sec(4)}>
        <TitleCard title="Curriculum Library" subtitle="Browse and organize lesson content" />
      </Sequence>

      {/* Overview - 0:04 to 0:10 */}
      <Sequence from={sec(4)} durationInFrames={sec(6)}>
        <MockUI screen="curriculum" />
        <NarrationText text="Manage curriculum by classroom and track developmental milestones." />
      </Sequence>

      {/* Age tabs - 0:10 to 0:18 */}
      <Sequence from={sec(10)} durationInFrames={sec(8)}>
        <MockUI screen="curriculum" highlightArea={{ x: 256, y: 100, width: 450, height: 44 }} />
        <NarrationText text="Switch between Infant, Toddler, Preschool, and School Age content." />
      </Sequence>

      {/* Lesson cards - 0:18 to 0:26 */}
      <Sequence from={sec(18)} durationInFrames={sec(8)}>
        <MockUI screen="curriculum" highlightArea={{ x: 288, y: 160, width: 900, height: 300 }} />
        <NarrationText text="Each card shows lesson title, age group, duration, and description." />
      </Sequence>

      {/* Organization - 0:26 to 0:34 */}
      <Sequence from={sec(26)} durationInFrames={sec(8)}>
        <MockUI screen="curriculum" />
        <NarrationText text="Create collections, mark favorites, and track which lessons you've used." style="tip" />
      </Sequence>

      {/* Outro - 0:34 to 0:40 */}
      <Sequence from={sec(34)} durationInFrames={sec(6)}>
        <TitleCard title="Build Your Library" subtitle="Lessons created in Lesson Builder appear here automatically" />
      </Sequence>
    </AbsoluteFill>
  );
};
