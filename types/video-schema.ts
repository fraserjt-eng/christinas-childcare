// types/video-schema.ts

/** Word-level timestamp from whisper.cpp */
export interface WordTimestamp {
  word: string;
  start: number; // seconds from segment start
  end: number;   // seconds from segment start
}

/** Element geometry captured during recording */
export interface ElementCapture {
  found: boolean;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
}

/** A recorded segment with captured metadata */
export interface RecordedSegment {
  id: string;
  startTimeMs: number;
  endTimeMs: number;
  audioPath: string;
  audioDurationMs: number;
  wordTimestamps: WordTimestamp[];
  element: ElementCapture;
  scrollFrom: number;
  scrollTo: number;
}

/** Page transition data for crossfade rendering */
export interface PageTransition {
  fromUrl: string;
  toUrl: string;
  timeMs: number;
}

/** Brand configuration */
export interface Branding {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  centerName: string;
  initial: string;
}

/** A chapter in the walkthrough manifest */
export interface ManifestChapter {
  id: string;
  title: string;
  type: 'avatar' | 'recording';
  avatarClip?: string;
  recordingFile?: string;
  audioFile: string;
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  words: WordTimestamp[];
  highlights?: { selector: string; startMs: number; endMs: number; boundingBox?: ElementCapture['boundingBox'] }[];
}

/** Complete manifest output from all pipeline phases */
export interface WalkthroughManifest {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  totalDurationMs: number;
  branding: Branding;
  chapters: ManifestChapter[];
  pageTransitions: PageTransition[];
}

/** Props passed to the WalkthroughVideo Remotion composition */
export interface WalkthroughVideoProps {
  manifest: WalkthroughManifest;
}
