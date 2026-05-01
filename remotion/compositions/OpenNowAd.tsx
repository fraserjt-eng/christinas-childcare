// "Open Now" — Christina's Child Care 9:16 paid-social ad.
// 1080x1920, 30 fps. Two compositions:
//   - OpenNowAd30s (900 frames): full 6-scene cut for primary placement
//   - OpenNowAd15s (450 frames): hook → proof → CTA cut for short placements
//
// Avatar talking-head clips are produced by Arcads (Veo 3.1) and live at
// public/platform-reel/open-now/avatar/clip-0{1..4}-*.mp4. If the clips don't
// exist yet, the composition still renders — the avatar Sequence shows a
// fallback warm wash so the rest of the timeline stays previewable.
//
// Real Christina's photos are pulled from public/platform-reel/ (mural,
// classroom, family group). Sarah VO for the proof pillars is generated via
// scripts/generate-platform-reel-vo.mjs — see the open-now line keys.
//
// To render:
//   npx remotion render remotion/index.tsx OpenNowAd30s public/platform-reel/open-now/output/open-now-30s-9x16.mp4
//   npx remotion render remotion/index.tsx OpenNowAd15s public/platform-reel/open-now/output/open-now-15s-9x16.mp4

import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { OPEN_NOW_COLORS } from '../components/openNow/colors';
import { HookCard } from '../components/openNow/HookCard';
import { ThreePillarOverlay } from '../components/openNow/ThreePillarOverlay';
import { LocationsSplit } from '../components/openNow/LocationsSplit';
import { CtaEndCard } from '../components/openNow/CtaEndCard';

// ─── Asset paths ──────────────────────────────────────────────────────────

const reel = (p: string) => staticFile(`platform-reel/${p}`);
const openNow = (p: string) => staticFile(`platform-reel/open-now/${p}`);

const ASSETS = {
  avatar: {
    hook: openNow('avatar/clip-01-hook.mp4'),
    solution: openNow('avatar/clip-02-solution.mp4'),
    locations: openNow('avatar/clip-03-locations.mp4'),
    cta: openNow('avatar/clip-04-cta.mp4'),
  },
  broll: {
    competitor: openNow('broll/broll-01-competitor.mp4'),
  },
  realPhotos: {
    mural: reel('africa-mural.jpg'),
    classroom: reel('center-kids.jpg'),
    family: reel('center-family.jpg'),
    community: reel('christina-community.jpg'),
  },
  audio: {
    sarahPillars: reel('vo/open-now-pillars.mp3'),
    ambient: reel('music.mp3'),
  },
};

// ─── Scene timing (in frames at 30fps) ─────────────────────────────────────
// Locked to the script in references/products/christinas/script-open-now.md.

const SCENES_30S = {
  hook: { from: 0, duration: 90 },          // 0:00 – 0:03
  problem: { from: 90, duration: 150 },     // 0:03 – 0:08
  solution: { from: 240, duration: 180 },   // 0:08 – 0:14
  proof: { from: 420, duration: 180 },      // 0:14 – 0:20
  locations: { from: 600, duration: 150 },  // 0:20 – 0:25
  cta: { from: 750, duration: 150 },        // 0:25 – 0:30
};

// 15s cut: HOOK → PROOF → CTA only.
const SCENES_15S = {
  hook: { from: 0, duration: 90 },          // 0:00 – 0:03
  proof: { from: 90, duration: 210 },       // 0:03 – 0:10
  cta: { from: 300, duration: 150 },        // 0:10 – 0:15
};

// ─── Helpers ───────────────────────────────────────────────────────────────

// Wrap an asset that may not exist yet (Arcads clips, Sarah VO mp3) so the
// composition keeps rendering during early dev. Remotion throws on missing
// staticFile() at render time but not at preview-load — wrap the consuming
// elements in error boundaries via this safe-render helper.
const SafeVideo: React.FC<{ src: string; volume?: number }> = ({ src, volume = 1 }) => {
  // OffthreadVideo will fail loudly if the file is missing; that's the right
  // behavior for a final render. For preview, the warm wash background
  // behind it keeps the timeline scrubbable.
  return <OffthreadVideo src={src} volume={volume} />;
};

const KenBurns: React.FC<{
  src: string;
  startScale?: number;
  endScale?: number;
  startX?: number;
  endX?: number;
  startY?: number;
  endY?: number;
}> = ({ src, startScale = 1.0, endScale = 1.12, startX = 0, endX = 0, startY = 0, endY = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(progress, [0, 1], [startScale, endScale]);
  const x = interpolate(progress, [0, 1], [startX, endX]);
  const y = interpolate(progress, [0, 1], [startY, endY]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: OPEN_NOW_COLORS.dark }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </AbsoluteFill>
  );
};

const WarmWash: React.FC<{ note?: string }> = ({ note }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% 40%, ${OPEN_NOW_COLORS.gold}33, ${OPEN_NOW_COLORS.cream})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      color: OPEN_NOW_COLORS.midGrey,
      fontFamily: 'system-ui',
    }}
  >
    {note && <div style={{ fontSize: 28, fontWeight: 700 }}>{note}</div>}
  </AbsoluteFill>
);

// ─── Scenes ────────────────────────────────────────────────────────────────

const SceneHook: React.FC = () => (
  <AbsoluteFill>
    <SafeVideo src={ASSETS.avatar.hook} />
    <HookCard />
  </AbsoluteFill>
);

const SceneProblem: React.FC = () => (
  <AbsoluteFill style={{ background: '#1f2937' }}>
    <SafeVideo src={ASSETS.broll.competitor} />
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.0) 60%, rgba(15,23,42,0.7) 100%)',
        pointerEvents: 'none',
      }}
    />
  </AbsoluteFill>
);

const SceneSolution: React.FC = () => {
  // 6 seconds total: three real photos at ~2s each with Ken Burns.
  return (
    <AbsoluteFill>
      {/* Avatar audio plays under the photo cuts (lips off-screen) */}
      <Sequence durationInFrames={180}>
        <Audio src={ASSETS.avatar.solution} volume={1} />
      </Sequence>
      <Sequence from={0} durationInFrames={60}>
        <KenBurns src={ASSETS.realPhotos.mural} startScale={1.05} endScale={1.18} />
      </Sequence>
      <Sequence from={60} durationInFrames={60}>
        <KenBurns src={ASSETS.realPhotos.classroom} startScale={1.0} endScale={1.12} startY={-20} endY={20} />
      </Sequence>
      <Sequence from={120} durationInFrames={60}>
        <KenBurns src={ASSETS.realPhotos.family} startScale={1.08} endScale={1.0} />
      </Sequence>
    </AbsoluteFill>
  );
};

const SceneProof: React.FC = () => (
  <AbsoluteFill>
    <ThreePillarOverlay />
    <Audio src={ASSETS.audio.sarahPillars} volume={1} />
  </AbsoluteFill>
);

const SceneLocations: React.FC = () => (
  <AbsoluteFill>
    <LocationsSplit />
    <Audio src={ASSETS.avatar.locations} volume={1} />
  </AbsoluteFill>
);

const SceneCta: React.FC = () => (
  <AbsoluteFill>
    <CtaEndCard />
    <Audio src={ASSETS.avatar.cta} volume={1} />
  </AbsoluteFill>
);

// ─── 30-second composition ─────────────────────────────────────────────────

export const OpenNowAd30s: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: OPEN_NOW_COLORS.dark }}>
      {/* Bed of ambient music under everything (low volume, ducks under VO) */}
      <Audio src={ASSETS.audio.ambient} volume={0.18} />

      <Sequence from={SCENES_30S.hook.from} durationInFrames={SCENES_30S.hook.duration}>
        <SceneHook />
      </Sequence>

      <Sequence from={SCENES_30S.problem.from} durationInFrames={SCENES_30S.problem.duration}>
        <SceneProblem />
      </Sequence>

      <Sequence from={SCENES_30S.solution.from} durationInFrames={SCENES_30S.solution.duration}>
        <SceneSolution />
      </Sequence>

      <Sequence from={SCENES_30S.proof.from} durationInFrames={SCENES_30S.proof.duration}>
        <SceneProof />
      </Sequence>

      <Sequence from={SCENES_30S.locations.from} durationInFrames={SCENES_30S.locations.duration}>
        <SceneLocations />
      </Sequence>

      <Sequence from={SCENES_30S.cta.from} durationInFrames={SCENES_30S.cta.duration}>
        <SceneCta />
      </Sequence>

      {/* Fallback so the timeline doesn't go pure-black if any clip is missing */}
      <AbsoluteFill style={{ zIndex: -1 }}>
        <WarmWash />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── 15-second composition ─────────────────────────────────────────────────
// HOOK → PROOF → CTA only. Same components, tighter timing.

export const OpenNowAd15s: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: OPEN_NOW_COLORS.dark }}>
      <Audio src={ASSETS.audio.ambient} volume={0.18} />

      <Sequence from={SCENES_15S.hook.from} durationInFrames={SCENES_15S.hook.duration}>
        <SceneHook />
      </Sequence>

      <Sequence from={SCENES_15S.proof.from} durationInFrames={SCENES_15S.proof.duration}>
        <SceneProof />
      </Sequence>

      <Sequence from={SCENES_15S.cta.from} durationInFrames={SCENES_15S.cta.duration}>
        <SceneCta />
      </Sequence>

      <AbsoluteFill style={{ zIndex: -1 }}>
        <WarmWash />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
