import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { TitleCard } from '../components/TitleCard';
import { NarrationText } from '../components/NarrationText';
import { MockUI } from '../components/MockUI';

export const ReportsVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  // Fast pacing - ~50 seconds total
  return (
    <AbsoluteFill style={{ background: '#1a1a1a' }}>
      {/* Title - 0:00 to 0:04 */}
      <Sequence from={0} durationInFrames={sec(4)}>
        <TitleCard title="Reports & Analytics" subtitle="Generate compliance and billing reports" />
      </Sequence>

      {/* Overview - 0:04 to 0:10 */}
      <Sequence from={sec(4)} durationInFrames={sec(6)}>
        <MockUI screen="reports" />
        <NarrationText text="Generate reports for billing, parents, and DCYF compliance visits." />
      </Sequence>

      {/* Report types - 0:10 to 0:20 */}
      <Sequence from={sec(10)} durationInFrames={sec(10)}>
        <MockUI screen="reports" highlightArea={{ x: 288, y: 100, width: 900, height: 350 }} />
        <NarrationText text="Attendance, Staff Hours, Ratios, Enrollment, Financial, and DCYF Export." />
      </Sequence>

      {/* DCYF highlight - 0:20 to 0:28 */}
      <Sequence from={sec(20)} durationInFrames={sec(8)}>
        <MockUI screen="reports" />
        <NarrationText text="DCYF Export is formatted specifically for licensing requirements." style="callout" />
      </Sequence>

      {/* Export options - 0:28 to 0:34 */}
      <Sequence from={sec(28)} durationInFrames={sec(6)}>
        <MockUI screen="reports" />
        <NarrationText text="Export as PDF, Excel, or CSV. PDFs include your center's branding." />
      </Sequence>

      {/* Outro - 0:34 to 0:40 */}
      <Sequence from={sec(34)} durationInFrames={sec(6)}>
        <TitleCard title="Ready for Any Request" subtitle="Professional reports in seconds" />
      </Sequence>
    </AbsoluteFill>
  );
};
