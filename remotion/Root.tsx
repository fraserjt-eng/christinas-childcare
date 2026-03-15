import { Composition } from 'remotion';
import { LessonBuilderVideo } from './compositions/LessonBuilderVideo';
import { CurriculumLibraryVideo } from './compositions/CurriculumLibraryVideo';
import { StaffManagementVideo } from './compositions/StaffManagementVideo';
import { AttendanceVideo } from './compositions/AttendanceVideo';
import { ReportsVideo } from './compositions/ReportsVideo';
import {
  LessonBuilderScreenRecording,
  CurriculumScreenRecording,
  StaffManagementScreenRecording,
  AttendanceScreenRecording,
  ReportsScreenRecording,
} from './compositions/ScreenRecordingVideo';
import { WelcomeVideo } from './compositions/WelcomeVideo';
import { EmployeeWorkflowVideo } from './compositions/EmployeeWorkflowVideo';
import { ParentExperienceVideo } from './compositions/ParentExperienceVideo';
import { SchedulingVideo } from './compositions/SchedulingVideo';
import { ComplianceVideo } from './compositions/ComplianceVideo';
import { CommunicationVideo } from './compositions/CommunicationVideo';
import { StaffDevelopmentVideo } from './compositions/StaffDevelopmentVideo';
import { BusinessIntelligenceVideo } from './compositions/BusinessIntelligenceVideo';

// Video settings
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ============================================
          MOCK UI VIDEOS (Animated demonstrations)
          Use these when you don't have screen recordings
          ============================================ */}
      <Composition
        id="LessonBuilder"
        component={LessonBuilderVideo}
        durationInFrames={FPS * 72} // ~72 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="CurriculumLibrary"
        component={CurriculumLibraryVideo}
        durationInFrames={FPS * 40} // ~40 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="StaffManagement"
        component={StaffManagementVideo}
        durationInFrames={FPS * 38} // ~38 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Attendance"
        component={AttendanceVideo}
        durationInFrames={FPS * 46} // ~46 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Reports"
        component={ReportsVideo}
        durationInFrames={FPS * 40} // ~40 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />

      {/* ============================================
          SCREEN RECORDING + VOICEOVER VIDEOS
          Use these after you record real screen captures

          To use:
          1. Record screen at 1920x1080
          2. Generate voiceover with ElevenLabs
          3. Place files in public/training/recordings/ and public/training/voiceovers/audio/
          4. Adjust duration below to match your recording
          ============================================ */}
      <Composition
        id="LessonBuilder-Recording"
        component={LessonBuilderScreenRecording}
        durationInFrames={FPS * 240} // ~4 minutes - adjust to actual duration
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Curriculum-Recording"
        component={CurriculumScreenRecording}
        durationInFrames={FPS * 250} // ~4:10 - adjust to actual duration
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="StaffManagement-Recording"
        component={StaffManagementScreenRecording}
        durationInFrames={FPS * 270} // ~4:30 - adjust to actual duration
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Attendance-Recording"
        component={AttendanceScreenRecording}
        durationInFrames={FPS * 220} // ~3:40 - adjust to actual duration
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Reports-Recording"
        component={ReportsScreenRecording}
        durationInFrames={FPS * 250} // ~4:10 - adjust to actual duration
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />

      {/* ============================================
          GENERIC TEMPLATE
          Use this for custom one-off videos
          Note: defaultProps must be provided via a wrapper component
          ============================================ */}

      {/* ============================================
          PORTAL & FEATURE OVERVIEW VIDEOS
          60s welcome + 7 x 50s feature videos
          ============================================ */}
      <Composition
        id="Welcome"
        component={WelcomeVideo}
        durationInFrames={FPS * 60} // 60 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="EmployeeWorkflow"
        component={EmployeeWorkflowVideo}
        durationInFrames={FPS * 60} // 60 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="ParentExperience"
        component={ParentExperienceVideo}
        durationInFrames={FPS * 50} // 50 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Scheduling"
        component={SchedulingVideo}
        durationInFrames={FPS * 50} // 50 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Compliance"
        component={ComplianceVideo}
        durationInFrames={FPS * 50} // 50 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="Communication"
        component={CommunicationVideo}
        durationInFrames={FPS * 50} // 50 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="StaffDevelopment"
        component={StaffDevelopmentVideo}
        durationInFrames={FPS * 50} // 50 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="BusinessIntelligence"
        component={BusinessIntelligenceVideo}
        durationInFrames={FPS * 50} // 50 seconds
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
    </>
  );
};
