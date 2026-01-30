import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { TitleCard } from '../components/TitleCard';
import { NarrationText } from '../components/NarrationText';
import { MockUI } from '../components/MockUI';

export const AttendanceVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  // Fast pacing - ~60 seconds total
  return (
    <AbsoluteFill style={{ background: '#1a1a1a' }}>
      {/* Title - 0:00 to 0:04 */}
      <Sequence from={0} durationInFrames={sec(4)}>
        <TitleCard title="Attendance Tracking" subtitle="Check-ins, ratios, and compliance" />
      </Sequence>

      {/* Overview - 0:04 to 0:10 */}
      <Sequence from={sec(4)} durationInFrames={sec(6)}>
        <MockUI screen="attendance" />
        <NarrationText text="Track daily attendance and monitor staff-to-child ratios in real-time." />
      </Sequence>

      {/* Stats cards - 0:10 to 0:18 */}
      <Sequence from={sec(10)} durationInFrames={sec(8)}>
        <MockUI screen="attendance" highlightArea={{ x: 288, y: 100, width: 900, height: 90 }} />
        <NarrationText text="Status cards show Present, Not Checked In, and Departed at a glance." />
      </Sequence>

      {/* Child list - 0:18 to 0:26 */}
      <Sequence from={sec(18)} durationInFrames={sec(8)}>
        <MockUI screen="attendance" highlightArea={{ x: 288, y: 210, width: 900, height: 250 }} />
        <NarrationText text="Click any child to check them in or out - time is recorded automatically." />
      </Sequence>

      {/* Filter - 0:26 to 0:32 */}
      <Sequence from={sec(26)} durationInFrames={sec(6)}>
        <MockUI screen="attendance" highlightArea={{ x: 1000, y: 220, width: 140, height: 36 }} />
        <NarrationText text="Filter by status: All, Present, Absent, or Departed." />
      </Sequence>

      {/* Ratio tip - 0:32 to 0:40 */}
      <Sequence from={sec(32)} durationInFrames={sec(8)}>
        <MockUI screen="attendance" />
        <NarrationText text="Green = compliant. Yellow/Red = take action immediately." style="callout" />
      </Sequence>

      {/* Outro - 0:40 to 0:46 */}
      <Sequence from={sec(40)} durationInFrames={sec(6)}>
        <TitleCard title="Stay Compliant" subtitle="Accurate records for DCYF licensing" />
      </Sequence>
    </AbsoluteFill>
  );
};
