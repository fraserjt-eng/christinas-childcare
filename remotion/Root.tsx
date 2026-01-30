import { Composition } from 'remotion';
import { LessonBuilderVideo } from './compositions/LessonBuilderVideo';
import { CurriculumLibraryVideo } from './compositions/CurriculumLibraryVideo';
import { StaffManagementVideo } from './compositions/StaffManagementVideo';
import { AttendanceVideo } from './compositions/AttendanceVideo';
import { ReportsVideo } from './compositions/ReportsVideo';

// Video settings
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
    </>
  );
};
