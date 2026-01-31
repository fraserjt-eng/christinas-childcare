import {
  AbsoluteFill,
  Sequence,
  Video,
  Audio,
  useVideoConfig,
  staticFile,
  Img,
} from 'remotion';
import { TitleCard } from '../components/TitleCard';
import { NarrationText } from '../components/NarrationText';

interface ScreenRecordingVideoProps {
  /** Title shown at the start */
  title: string;
  /** Subtitle shown at the start */
  subtitle: string;
  /** Path to the screen recording video file (relative to public folder) */
  screenRecordingPath: string;
  /** Path to the voiceover audio file (relative to public folder) */
  voiceoverPath: string;
  /** Optional captions/narration text overlay at specific times */
  captions?: {
    startFrame: number;
    durationFrames: number;
    text: string;
    style?: 'subtitle' | 'callout' | 'tip';
  }[];
  /** Duration of title card in seconds */
  titleDuration?: number;
  /** Duration of outro card in seconds */
  outroDuration?: number;
  /** Outro title */
  outroTitle?: string;
  /** Outro subtitle */
  outroSubtitle?: string;
}

/**
 * ScreenRecordingVideo - Composition for combining screen recordings with voiceovers
 *
 * This composition:
 * 1. Shows a title card at the beginning
 * 2. Plays the screen recording with voiceover audio
 * 3. Optionally displays captions/narration text at specified times
 * 4. Shows an outro card at the end
 */
export const ScreenRecordingVideo: React.FC<ScreenRecordingVideoProps> = ({
  title,
  subtitle,
  screenRecordingPath,
  voiceoverPath,
  captions = [],
  titleDuration = 4,
  outroDuration = 5,
  outroTitle = 'Get Started!',
  outroSubtitle = 'Visit the admin dashboard to try it yourself',
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  const titleFrames = sec(titleDuration);
  const outroFrames = sec(outroDuration);
  const mainContentStart = titleFrames;
  const mainContentDuration = durationInFrames - titleFrames - outroFrames;

  return (
    <AbsoluteFill style={{ background: '#1a1a1a' }}>
      {/* Title Card */}
      <Sequence from={0} durationInFrames={titleFrames}>
        <TitleCard title={title} subtitle={subtitle} />
      </Sequence>

      {/* Main Content: Screen Recording + Voiceover */}
      <Sequence from={mainContentStart} durationInFrames={mainContentDuration}>
        <AbsoluteFill>
          {/* Screen Recording Video */}
          <Video
            src={staticFile(screenRecordingPath)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#1a1a1a',
            }}
          />

          {/* Voiceover Audio */}
          <Audio src={staticFile(voiceoverPath)} />
        </AbsoluteFill>
      </Sequence>

      {/* Captions/Narration Text Overlays */}
      {captions.map((caption, index) => (
        <Sequence
          key={index}
          from={mainContentStart + caption.startFrame}
          durationInFrames={caption.durationFrames}
        >
          <NarrationText text={caption.text} style={caption.style || 'subtitle'} />
        </Sequence>
      ))}

      {/* Outro Card */}
      <Sequence from={durationInFrames - outroFrames} durationInFrames={outroFrames}>
        <TitleCard title={outroTitle} subtitle={outroSubtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * Example composition configuration for the Lesson Builder video
 */
export const LessonBuilderScreenRecording: React.FC = () => {
  return (
    <ScreenRecordingVideo
      title="Lesson Builder"
      subtitle="Create AI-powered lesson plans"
      screenRecordingPath="training/recordings/lesson-builder-recording.mp4"
      voiceoverPath="training/voiceovers/audio/lesson-builder-voiceover.mp3"
      outroTitle="Start Creating!"
      outroSubtitle="Go to Lessons in your admin dashboard"
      captions={[
        // Add caption overlays for key moments (optional)
        // These appear on top of the screen recording at specific times
      ]}
    />
  );
};

/**
 * Example composition configuration for the Curriculum Library video
 */
export const CurriculumScreenRecording: React.FC = () => {
  return (
    <ScreenRecordingVideo
      title="Curriculum Library"
      subtitle="Organize and manage your lessons"
      screenRecordingPath="training/recordings/curriculum-recording.mp4"
      voiceoverPath="training/voiceovers/audio/curriculum-voiceover.mp3"
      outroTitle="Explore Your Library!"
      outroSubtitle="Go to Curriculum in your admin dashboard"
    />
  );
};

/**
 * Example composition configuration for the Staff Management video
 */
export const StaffManagementScreenRecording: React.FC = () => {
  return (
    <ScreenRecordingVideo
      title="Staff Management"
      subtitle="Manage your team and certifications"
      screenRecordingPath="training/recordings/staff-management-recording.mp4"
      voiceoverPath="training/voiceovers/audio/staff-management-voiceover.mp3"
      outroTitle="Manage Your Team!"
      outroSubtitle="Go to Staff in your admin dashboard"
    />
  );
};

/**
 * Example composition configuration for the Attendance video
 */
export const AttendanceScreenRecording: React.FC = () => {
  return (
    <ScreenRecordingVideo
      title="Attendance & Ratios"
      subtitle="Track daily attendance and maintain compliance"
      screenRecordingPath="training/recordings/attendance-recording.mp4"
      voiceoverPath="training/voiceovers/audio/attendance-voiceover.mp3"
      outroTitle="Start Tracking!"
      outroSubtitle="Go to Attendance in your admin dashboard"
    />
  );
};

/**
 * Example composition configuration for the Reports video
 */
export const ReportsScreenRecording: React.FC = () => {
  return (
    <ScreenRecordingVideo
      title="Reports & Analytics"
      subtitle="Generate insights and compliance reports"
      screenRecordingPath="training/recordings/reports-recording.mp4"
      voiceoverPath="training/voiceovers/audio/reports-voiceover.mp3"
      outroTitle="Generate Reports!"
      outroSubtitle="Go to Reports in your admin dashboard"
    />
  );
};
