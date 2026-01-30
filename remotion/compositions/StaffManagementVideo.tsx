import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { TitleCard } from '../components/TitleCard';
import { NarrationText } from '../components/NarrationText';
import { MockUI } from '../components/MockUI';

export const StaffManagementVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  // Fast pacing - ~55 seconds total
  return (
    <AbsoluteFill style={{ background: '#1a1a1a' }}>
      {/* Title - 0:00 to 0:04 */}
      <Sequence from={0} durationInFrames={sec(4)}>
        <TitleCard title="Staff Directory" subtitle="Profiles, certifications, and schedules" />
      </Sequence>

      {/* Overview - 0:04 to 0:10 */}
      <Sequence from={sec(4)} durationInFrames={sec(6)}>
        <MockUI screen="staff" />
        <NarrationText text="Manage your team's profiles, certifications, and classroom assignments." />
      </Sequence>

      {/* Staff cards - 0:10 to 0:18 */}
      <Sequence from={sec(10)} durationInFrames={sec(8)}>
        <MockUI screen="staff" highlightArea={{ x: 288, y: 180, width: 900, height: 280 }} />
        <NarrationText text="Each card shows name, role, and certification badges." />
      </Sequence>

      {/* Tabs - 0:18 to 0:24 */}
      <Sequence from={sec(18)} durationInFrames={sec(6)}>
        <MockUI screen="staff" highlightArea={{ x: 256, y: 130, width: 300, height: 44 }} />
        <NarrationText text="Switch between Profiles and Schedule Overview tabs." />
      </Sequence>

      {/* Certifications - 0:24 to 0:32 */}
      <Sequence from={sec(24)} durationInFrames={sec(8)}>
        <MockUI screen="staff" />
        <NarrationText text="System tracks expiration dates - get alerts before anything expires." style="tip" />
      </Sequence>

      {/* Outro - 0:32 to 0:38 */}
      <Sequence from={sec(32)} durationInFrames={sec(6)}>
        <TitleCard title="Stay Organized" subtitle="Keep certifications current for DCYF compliance" />
      </Sequence>
    </AbsoluteFill>
  );
};
