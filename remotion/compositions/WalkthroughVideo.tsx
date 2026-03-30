import { AbsoluteFill, Sequence, Video, Audio, staticFile } from 'remotion';
import { BrandedTitleCard } from '../components/BrandedTitleCard';
import { ChapterCard } from '../components/ChapterCard';
import { KaraokeCaption } from '../components/KaraokeCaption';
import { AvatarPIP } from '../components/AvatarPIP';
import { ProgressBar } from '../components/ProgressBar';
import { PageTransitionOverlay } from '../components/PageTransition';
import type { WalkthroughManifest, RecordedSegment } from '@/types/video-schema';

const TITLE_CARD_FRAMES = 120; // 4s at 30fps
const CHAPTER_CARD_FRAMES = 90; // 3s at 30fps

interface WalkthroughVideoProps {
  manifest: WalkthroughManifest;
}

export const WalkthroughVideo: React.FC<WalkthroughVideoProps> = ({ manifest }) => {
  const fps = manifest.fps || 30;
  let currentFrame = 0;

  const sequences: React.ReactElement[] = [];

  // Layer 1: Opening title card
  sequences.push(
    <Sequence key="title" from={currentFrame} durationInFrames={TITLE_CARD_FRAMES}>
      <BrandedTitleCard
        title={manifest.title}
        subtitle="Complete Guide"
        brandName={manifest.branding.centerName}
        brandInitial={manifest.branding.initial}
        primaryColor={manifest.branding.primaryColor}
        badge="Admin Portal Walkthrough"
      />
    </Sequence>
  );
  currentFrame += TITLE_CARD_FRAMES;

  const contentStartFrame = currentFrame;

  // Layer 2: Chapter cards and content sequences
  for (let i = 0; i < manifest.chapters.length; i++) {
    const chapter = manifest.chapters[i];
    const chapterFrames = Math.round((chapter.durationMs / 1000) * fps);

    // Chapter intro card
    sequences.push(
      <Sequence
        key={`chapter-card-${chapter.id}`}
        from={currentFrame}
        durationInFrames={CHAPTER_CARD_FRAMES}
      >
        <ChapterCard
          title={chapter.title}
          subtitle={chapter.type === 'avatar' ? 'Overview' : 'Screen Walkthrough'}
          chapterIndex={i}
          totalChapters={manifest.chapters.length}
          primaryColor={manifest.branding.primaryColor}
        />
      </Sequence>
    );
    currentFrame += CHAPTER_CARD_FRAMES;

    if (chapter.type === 'avatar' && chapter.avatarClip) {
      // Avatar chapter: full-frame avatar clip with branded dark background
      const avatarStart = currentFrame;
      const avatarEnd = currentFrame + chapterFrames - 1;

      sequences.push(
        <Sequence key={`content-${chapter.id}`} from={currentFrame} durationInFrames={chapterFrames}>
          <AbsoluteFill
            style={{
              background: `linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)`,
            }}
          >
            <Video
              src={staticFile(chapter.avatarClip)}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </AbsoluteFill>
          <Audio src={staticFile(chapter.audioFile)} />
        </Sequence>
      );

      // AvatarPIP renders itself based on absolute frame range, so it is placed
      // at the composition level (outside the Sequence) using the absolute frame window.
      // We use a wrapper Sequence spanning the whole composition to host it.
      sequences.push(
        <Sequence
          key={`avatar-pip-${chapter.id}`}
          from={0}
          durationInFrames={TITLE_CARD_FRAMES + 9999999}
        >
          <AvatarPIP
            src={staticFile(chapter.avatarClip)}
            isVideo
            startFrame={avatarStart}
            endFrame={avatarEnd}
            size={0} // Hidden: full-frame video above handles display; PIP only used in recording chapters
          />
        </Sequence>
      );
    } else if (chapter.type === 'recording' && chapter.recordingFile) {
      // Recording chapter: screen recording fills the frame
      const recStart = currentFrame;
      const recEnd = currentFrame + chapterFrames - 1;

      sequences.push(
        <Sequence key={`content-${chapter.id}`} from={currentFrame} durationInFrames={chapterFrames}>
          <AbsoluteFill style={{ background: '#1a1a1a' }}>
            <Video
              src={staticFile(chapter.recordingFile)}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </AbsoluteFill>
          <Audio src={staticFile(chapter.audioFile)} />
        </Sequence>
      );

      // Avatar PIP overlay for recording chapters (bottom-right corner)
      if (chapter.avatarClip) {
        sequences.push(
          <Sequence
            key={`avatar-pip-${chapter.id}`}
            from={0}
            durationInFrames={TITLE_CARD_FRAMES + 9999999}
          >
            <AvatarPIP
              src={staticFile(chapter.avatarClip)}
              isVideo
              startFrame={recStart}
              endFrame={recEnd}
              size={200}
            />
          </Sequence>
        );
      }
    }

    currentFrame += chapterFrames;
  }

  // Build segments array for KaraokeCaption (flatten chapters that have word timestamps)
  const allSegments: RecordedSegment[] = manifest.chapters
    .filter((ch) => ch.words && ch.words.length > 0)
    .map((ch) => ({
      id: ch.id,
      startTimeMs: ch.startTimeMs,
      endTimeMs: ch.endTimeMs,
      audioPath: ch.audioFile,
      audioDurationMs: ch.durationMs,
      wordTimestamps: ch.words,
      element: { found: false, boundingBox: null },
      scrollFrom: 0,
      scrollTo: 0,
    }));

  return (
    <AbsoluteFill>
      {/* Layers 1 and 2: title card + chapter cards + content */}
      {sequences}

      {/* Layer 3: Karaoke word-level captions at the bottom */}
      <KaraokeCaption segments={allSegments} contentStartFrame={contentStartFrame} />

      {/* Layer 4: Page crossfade transitions */}
      <PageTransitionOverlay
        transitions={manifest.pageTransitions}
        contentStartFrame={contentStartFrame}
      />

      {/* Layer 5: Progress bar and chapter counter at the top */}
      {manifest.chapters.length > 0 && (
        <ProgressBar manifest={manifest} contentStartFrame={contentStartFrame} />
      )}
    </AbsoluteFill>
  );
};
