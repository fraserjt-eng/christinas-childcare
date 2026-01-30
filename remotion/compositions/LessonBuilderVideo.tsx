import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { TitleCard } from '../components/TitleCard';
import { NarrationText } from '../components/NarrationText';
import { MockUI } from '../components/MockUI';

export const LessonBuilderVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  // Fast pacing - ~90 seconds total
  return (
    <AbsoluteFill style={{ background: '#1a1a1a' }}>
      {/* Title - 0:00 to 0:04 */}
      <Sequence from={0} durationInFrames={sec(4)}>
        <TitleCard title="Lesson Builder" subtitle="Create AI-powered lesson plans" />
      </Sequence>

      {/* Show interface - 0:04 to 0:10 */}
      <Sequence from={sec(4)} durationInFrames={sec(6)}>
        <MockUI screen="lesson-builder" />
        <NarrationText text="The Lesson Builder creates engaging, age-appropriate lessons using AI." />
      </Sequence>

      {/* Tabs overview - 0:10 to 0:16 */}
      <Sequence from={sec(10)} durationInFrames={sec(6)}>
        <MockUI screen="lesson-builder" highlightArea={{ x: 256, y: 130, width: 500, height: 44 }} />
        <NarrationText text="Four tabs: New Lesson, Library, Remix, and Analytics." />
      </Sequence>

      {/* Age Group - 0:16 to 0:22 */}
      <Sequence from={sec(16)} durationInFrames={sec(6)}>
        <MockUI screen="lesson-builder" highlightArea={{ x: 288, y: 220, width: 380, height: 70 }} />
        <NarrationText text="Select age group - AI adapts vocabulary and activities." />
      </Sequence>

      {/* Topic - 0:22 to 0:28 */}
      <Sequence from={sec(22)} durationInFrames={sec(6)}>
        <MockUI screen="lesson-builder" highlightArea={{ x: 288, y: 300, width: 380, height: 70 }} />
        <NarrationText text="Enter your topic: Colors, Butterflies, Community Helpers..." />
      </Sequence>

      {/* Domain - 0:28 to 0:34 */}
      <Sequence from={sec(28)} durationInFrames={sec(6)}>
        <MockUI screen="lesson-builder" highlightArea={{ x: 288, y: 380, width: 380, height: 70 }} />
        <NarrationText text="Choose learning domain: Cognitive, Language, Physical, or Creative." />
      </Sequence>

      {/* Generate button - 0:34 to 0:42 */}
      <Sequence from={sec(34)} durationInFrames={sec(8)}>
        <MockUI screen="lesson-builder" highlightArea={{ x: 288, y: 530, width: 380, height: 44 }} showCursor cursorPosition={{ x: 478, y: 552 }} />
        <NarrationText text="Click Generate - AI creates your lesson in 10-30 seconds!" style="callout" />
      </Sequence>

      {/* Preview - 0:42 to 0:50 */}
      <Sequence from={sec(42)} durationInFrames={sec(8)}>
        <MockUI screen="lesson-builder" highlightArea={{ x: 700, y: 180, width: 450, height: 350 }} />
        <NarrationText text="Preview shows objectives, materials, activities, and assessment ideas." />
      </Sequence>

      {/* Library tab - 0:50 to 0:58 */}
      <Sequence from={sec(50)} durationInFrames={sec(8)}>
        <MockUI screen="lesson-builder" highlightArea={{ x: 360, y: 130, width: 140, height: 44 }} />
        <NarrationText text="Saved lessons appear in your Library - search and filter anytime." />
      </Sequence>

      {/* Remix - 0:58 to 1:06 */}
      <Sequence from={sec(58)} durationInFrames={sec(8)}>
        <MockUI screen="lesson-builder" highlightArea={{ x: 500, y: 130, width: 80, height: 44 }} />
        <NarrationText text="Remix adapts lessons for different age groups automatically." style="tip" />
      </Sequence>

      {/* Outro - 1:06 to 1:12 */}
      <Sequence from={sec(66)} durationInFrames={sec(6)}>
        <TitleCard title="Start Creating!" subtitle="Go to Lesson Builder in your admin dashboard" />
      </Sequence>
    </AbsoluteFill>
  );
};
