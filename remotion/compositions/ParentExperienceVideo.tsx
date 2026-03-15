import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TitleCard } from '../components/TitleCard';
import { NarrationText } from '../components/NarrationText';

const BRAND_RED = '#C62828';
const BG_DARK = '#1a1a2e';
const TEXT_SECONDARY = '#94a3b8';
const CARD_BG = 'rgba(255,255,255,0.05)';
const CARD_BORDER = '1px solid rgba(255,255,255,0.1)';

function useFadeUp(frame: number, start = 0, distance = 40): React.CSSProperties {
  const opacity = interpolate(frame, [start, start + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(frame, [start, start + 20], [distance, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return { opacity, transform: `translateY(${y}px)` };
}

// ─── Scene: Photo gallery ─────────────────────────────────────────────────────

const PhotoGalleryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const photos = [
    { color: '#7c3aed', label: 'Story time', hearts: 3 },
    { color: '#0891b2', label: 'Outdoor play', hearts: 5 },
    { color: '#b45309', label: 'Art corner', hearts: 2 },
    { color: '#16a34a', label: 'Snack time', hearts: 4 },
  ];

  // Heart reaction pops in on second photo
  const heartScale = spring({ frame: frame - 60, fps, config: { damping: 12, stiffness: 150 } });
  const heartOpacity = interpolate(frame, [60, 75, 120, 135], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Daily Photo Gallery</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>See your child's day as it happens</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {photos.map((p, i) => {
          const cardOpacity = interpolate(frame, [15 + i * 10, 30 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const cardY = interpolate(frame, [15 + i * 10, 30 + i * 10], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={p.label} style={{ opacity: cardOpacity, transform: `translateY(${cardY}px)`, position: 'relative' }}>
              <div style={{ width: 200, height: 200, borderRadius: 20, background: p.color, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 14 }}>
                <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 13, color: 'white', margin: 0 }}>{p.label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'white' }}>
                    <span>❤️</span>
                    <span>{p.hearts}</span>
                  </div>
                </div>
              </div>
              {/* Animated heart on second photo */}
              {i === 1 && (
                <div style={{ position: 'absolute', top: -20, right: -10, opacity: heartOpacity, transform: `scale(${interpolate(heartScale, [0, 1], [0, 1.2])})`, fontSize: 36 }}>
                  ❤️
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ ...useFadeUp(frame, 65), display: 'flex', gap: 12 }}>
        {['❤️ React', '💬 Comment', '📥 Download'].map((action) => (
          <div key={action} style={{ padding: '10px 24px', background: CARD_BG, border: CARD_BORDER, borderRadius: 12, fontSize: 16, color: 'white' }}>
            {action}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Newsletter ────────────────────────────────────────────────────────

const NewsletterScene: React.FC = () => {
  const frame = useCurrentFrame();

  const sections = [
    { icon: '📖', title: "This Week's Theme", desc: 'Spring! We explored butterflies, planting seeds, and outdoor nature walks.' },
    { icon: '🎨', title: 'Art Highlight', desc: 'The toddlers made handprint trees — take-home copies come on Friday.' },
    { icon: '📅', title: 'Coming Up', desc: 'Picture day is Thursday. Wear your best smiles!' },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 36 }}>
      {/* Newsletter "paper" */}
      <div style={{ width: 680, background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', ...useFadeUp(frame, 0) }}>
        {/* Header */}
        <div style={{ background: BRAND_RED, padding: '24px 32px' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Little Stars Classroom</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'white', margin: 0 }}>Weekly Newsletter</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>March 10–14, 2026</p>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map((s, i) => {
            const sectionOpacity = interpolate(frame, [20 + i * 14, 36 + i * 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const sectionX = interpolate(frame, [20 + i * 14, 36 + i * 14], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={s.title} style={{ opacity: sectionOpacity, transform: `translateX(${sectionX}px)`, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(198,40,40,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{s.title}</p>
                  <p style={{ fontSize: 14, color: '#71717a', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={useFadeUp(frame, 65)}>
        <p style={{ fontSize: 16, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Delivered every Friday afternoon</p>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Notification preferences ─────────────────────────────────────────

const NotificationScene: React.FC = () => {
  const frame = useCurrentFrame();

  const channels = [
    { icon: '📧', label: 'Email', sub: 'Daily summaries and newsletters', enabled: true },
    { icon: '💬', label: 'Text Message', sub: 'Urgent alerts only', enabled: true },
    { icon: '📞', label: 'Phone Call', sub: 'Emergencies only', enabled: false },
    { icon: '🔔', label: 'App Push', sub: 'Real-time photo uploads', enabled: true },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Your Notification Preferences</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>You control what arrives and when</p>
      </div>

      <div style={{ width: 560, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {channels.map((ch, i) => {
          const itemOpacity = interpolate(frame, [18 + i * 12, 34 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const itemX = interpolate(frame, [18 + i * 12, 34 + i * 12], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={ch.label} style={{ opacity: itemOpacity, transform: `translateX(${itemX}px)`, display: 'flex', alignItems: 'center', gap: 20, background: CARD_BG, border: CARD_BORDER, borderRadius: 16, padding: '16px 24px' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(198,40,40,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                {ch.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: 'white', margin: '0 0 2px' }}>{ch.label}</p>
                <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: 0 }}>{ch.sub}</p>
              </div>
              {/* Toggle */}
              <div style={{ width: 52, height: 28, borderRadius: 14, background: ch.enabled ? BRAND_RED : 'rgba(255,255,255,0.1)', position: 'relative', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 4, left: ch.enabled ? 28 : 4, width: 20, height: 20, borderRadius: '50%', background: 'white' }} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Messages ──────────────────────────────────────────────────────────

const MessagesScene: React.FC = () => {
  const frame = useCurrentFrame();

  const messages = [
    { from: 'Christina\'s Care', text: 'Reminder: Picture day is Thursday! Please wear dress clothes.', time: '9:02 AM', type: 'announcement' },
    { from: 'Ms. Maria (Little Stars)', text: 'Emma had a wonderful morning! She loved the butterfly craft.', time: '11:45 AM', type: 'teacher' },
    { from: 'Christina\'s Care', text: 'Lunch menu change today: grilled cheese instead of soup.', time: '11:58 AM', type: 'announcement' },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 36 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Messages & Announcements</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>One place for everything from the center</p>
      </div>

      <div style={{ width: 620, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg, i) => {
          const msgOpacity = interpolate(frame, [18 + i * 15, 34 + i * 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const msgY = interpolate(frame, [18 + i * 15, 34 + i * 15], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const isTeacher = msg.type === 'teacher';
          return (
            <div key={i} style={{ opacity: msgOpacity, transform: `translateY(${msgY}px)`, display: 'flex', gap: 16, background: CARD_BG, border: isTeacher ? `1px solid ${BRAND_RED}40` : CARD_BORDER, borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: isTeacher ? BRAND_RED : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {isTeacher ? '👩‍🏫' : '🏠'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>{msg.from}</p>
                  <p style={{ fontSize: 13, color: TEXT_SECONDARY, margin: 0 }}>{msg.time}</p>
                </div>
                <p style={{ fontSize: 15, color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>{msg.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const ParentExperienceVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      {/* Title — 0s–7s */}
      <Sequence from={0} durationInFrames={sec(7)}>
        <TitleCard title="Stay Connected with Your Child" subtitle="Christina's Parent Portal" />
      </Sequence>

      {/* Photos — 7s–16s */}
      <Sequence from={sec(7)} durationInFrames={sec(9)}>
        <PhotoGalleryScene />
        <NarrationText text="Daily photos land in your gallery the moment teachers upload them. React, comment, or save them." />
      </Sequence>

      {/* Newsletter — 16s–25s */}
      <Sequence from={sec(16)} durationInFrames={sec(9)}>
        <NewsletterScene />
        <NarrationText text="Every Friday, a newsletter arrives with what your child learned, made, and played that week." />
      </Sequence>

      {/* Notifications — 25s–34s */}
      <Sequence from={sec(25)} durationInFrames={sec(9)}>
        <NotificationScene />
        <NarrationText text="Set how you want to hear from us — email, text, push, or calls for emergencies only." />
      </Sequence>

      {/* Messages — 34s–43s */}
      <Sequence from={sec(34)} durationInFrames={sec(9)}>
        <MessagesScene />
        <NarrationText text="Announcements and teacher notes all live in one inbox. No more missed flyers." />
      </Sequence>

      {/* Outro — 43s–50s */}
      <Sequence from={sec(43)} durationInFrames={sec(7)}>
        <TitleCard
          title="Your child's day, always just a tap away."
          subtitle="Log in anytime at christinas.app"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
