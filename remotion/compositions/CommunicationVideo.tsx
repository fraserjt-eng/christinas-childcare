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

// ─── Scene: Newsletter builder ────────────────────────────────────────────────

const NewsletterBuilderScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Simulate typing in the title field
  const fullTitle = "Little Stars Weekly — March 10–14";
  const charCount = Math.round(interpolate(frame, [25, 70], [0, fullTitle.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const typedTitle = fullTitle.slice(0, charCount);

  const sectionBlocks = [
    { icon: '📖', label: 'Theme of the Week', color: '#7c3aed' },
    { icon: '🎨', label: 'Art Highlight', color: '#0891b2' },
    { icon: '📅', label: 'Upcoming Events', color: '#16a34a' },
    { icon: '📸', label: 'Photo Gallery', color: '#b45309' },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', gap: 40, flexDirection: 'column' }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Newsletter Builder</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Rich text, sections, and branding — no design skills needed</p>
      </div>

      <div style={{ display: 'flex', gap: 32, width: 1100 }}>
        {/* Left: Editor panel */}
        <div style={{ ...useFadeUp(frame, 12), flex: 1, background: CARD_BG, border: CARD_BORDER, borderRadius: 20, padding: 28 }}>
          <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Newsletter Title</p>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 16, color: 'white', minHeight: 46 }}>
            {typedTitle}
            <span style={{ opacity: frame % 30 < 15 ? 1 : 0, color: BRAND_RED }}>|</span>
          </div>

          <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Sections</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sectionBlocks.map((s, i) => {
              const blockOpacity = interpolate(frame, [30 + i * 10, 44 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              const blockX = interpolate(frame, [30 + i * 10, 44 + i * 10], [-16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <div key={s.label} style={{ opacity: blockOpacity, transform: `translateX(${blockX}px)`, display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: CARD_BORDER, borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <p style={{ fontSize: 15, color: 'white', margin: 0, flex: 1 }}>{s.label}</p>
                  <p style={{ fontSize: 20, color: TEXT_SECONDARY, margin: 0 }}>⋮⋮</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live preview */}
        <div style={{ ...useFadeUp(frame, 20), width: 340 }}>
          <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Live Preview</p>
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
            <div style={{ background: BRAND_RED, padding: '18px 20px' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '0 0 2px' }}>Christina&apos;s Child Care Center</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>{typedTitle || 'Newsletter Title'}</p>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sectionBlocks.slice(0, 3).map((s) => (
                <div key={s.label} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 4, height: 32, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{s.label}</p>
                    <p style={{ fontSize: 10, color: '#71717a', margin: '2px 0 0' }}>Click to add content...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Drag-and-drop reordering ─────────────────────────────────────────

const ReorderScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Drag "Art Highlight" from position 1 to position 2
  const dragProgress = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dragY = interpolate(dragProgress, [0, 0.5, 1], [0, 60, 60]);
  const dragScale = interpolate(frame, [30, 40, 70, 80], [1, 1.05, 1.05, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const sectionOrder = dragProgress < 0.9
    ? ['Theme of the Week', 'Art Highlight (dragging)', 'Upcoming Events', 'Photo Gallery']
    : ['Theme of the Week', 'Upcoming Events', 'Art Highlight', 'Photo Gallery'];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Drag to Reorder Sections</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Rearrange until the story flows exactly how you want it</p>
      </div>

      <div style={{ width: 500, position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sectionOrder.map((label, i) => {
          const isDragging = label.includes('dragging');
          const cleanLabel = label.replace(' (dragging)', '');
          return (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: isDragging ? `rgba(198,40,40,0.12)` : CARD_BG,
                border: isDragging ? `1px solid ${BRAND_RED}60` : CARD_BORDER,
                borderRadius: 14,
                padding: '16px 20px',
                transform: isDragging ? `translateY(${dragY}px) scale(${dragScale})` : 'none',
                boxShadow: isDragging ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
                zIndex: isDragging ? 10 : 1,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, color: TEXT_SECONDARY, fontSize: 14 }}>
                <span>⋮⋮</span>
              </div>
              <p style={{ fontSize: 17, fontWeight: 600, color: isDragging ? BRAND_RED : 'white', margin: 0 }}>{cleanLabel}</p>
              <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 0 auto' }}>Section {i + 1}</p>
            </div>
          );
        })}
      </div>

      <div style={{ ...useFadeUp(frame, 80), fontSize: 16, color: TEXT_SECONDARY, textAlign: 'center' }}>
        Reorder saves automatically
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Branded preview + PDF export ─────────────────────────────────────

const BrandedPreviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pdfScale = spring({ frame: frame - 60, fps, config: { damping: 16, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', gap: 48, flexDirection: 'column' }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Branded PDF Export</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Your logo, your colors — ready to share or print</p>
      </div>

      <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
        {/* Preview */}
        <div style={{ ...useFadeUp(frame, 12), width: 360, background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          {/* Header */}
          <div style={{ background: BRAND_RED, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white' }}>C</div>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Christina&apos;s Child Care Center</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>Little Stars Weekly</p>
            </div>
          </div>
          {/* Body */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['This Week: Spring!', 'Art Highlight', 'Upcoming Events'].map((s, i) => (
              <div key={s} style={{ paddingBottom: 12, borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{s}</p>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, width: '85%', marginBottom: 4 }} />
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, width: '60%' }} />
              </div>
            ))}
          </div>
          {/* Footer */}
          <div style={{ background: '#f9f9f9', padding: '12px 24px', borderTop: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: 11, color: '#999', margin: 0 }}>5510 W Broadway Ave, Crystal, MN · (763) 555-0100</p>
          </div>
        </div>

        {/* Export actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 20 }}>
          {[
            { icon: '📄', label: 'Download PDF', sub: 'Print or archive', scale: pdfScale, delay: 60 },
            { icon: '📧', label: 'Email to Families', sub: 'Send to all enrolled parents', scale: 1, delay: 45 },
            { icon: '📲', label: 'Push Notification', sub: 'Alert families it is ready', scale: 1, delay: 55 },
          ].map((action) => {
            const btnOpacity = interpolate(frame, [action.delay, action.delay + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const btnY = interpolate(frame, [action.delay, action.delay + 18], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={action.label} style={{ opacity: btnOpacity, transform: `translateY(${btnY}px)`, display: 'flex', alignItems: 'center', gap: 16, background: CARD_BG, border: CARD_BORDER, borderRadius: 14, padding: '14px 20px', width: 300 }}>
                <div style={{ fontSize: 28 }}>{action.icon}</div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>{action.label}</p>
                  <p style={{ fontSize: 13, color: TEXT_SECONDARY, margin: 0 }}>{action.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Engagement analytics ─────────────────────────────────────────────

const EngagementScene: React.FC = () => {
  const frame = useCurrentFrame();

  const families = [
    { name: 'Thompson family', opened: true, time: '4:23 PM' },
    { name: 'Garcia family', opened: true, time: '4:51 PM' },
    { name: 'Williams family', opened: false, time: '' },
    { name: 'Brown family', opened: true, time: '6:12 PM' },
    { name: 'Patel family', opened: true, time: '7:04 PM' },
  ];

  const openRate = 80;
  const barWidth = interpolate(frame, [20, 60], [0, openRate], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Who Engaged</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>See which families read each newsletter</p>
      </div>

      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
        {/* Open rate meter */}
        <div style={{ ...useFadeUp(frame, 12), width: 300, background: CARD_BG, border: CARD_BORDER, borderRadius: 20, padding: 28 }}>
          <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Open Rate</p>
          <p style={{ fontSize: 64, fontWeight: 900, color: '#4ade80', margin: '0 0 16px', lineHeight: 1 }}>{Math.round(barWidth)}%</p>
          <div style={{ height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ width: `${barWidth}%`, height: '100%', background: '#4ade80', borderRadius: 6 }} />
          </div>
          <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '12px 0 0' }}>4 of 5 families opened</p>
        </div>

        {/* Per-family list */}
        <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {families.map((fam, i) => {
            const rowOpacity = interpolate(frame, [20 + i * 10, 35 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const rowX = interpolate(frame, [20 + i * 10, 35 + i * 10], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={fam.name} style={{ opacity: rowOpacity, transform: `translateX(${rowX}px)`, display: 'flex', alignItems: 'center', gap: 14, background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: '12px 18px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: fam.opened ? '#4ade80' : '#f87171', flexShrink: 0 }} />
                <p style={{ fontSize: 15, color: 'white', margin: 0, flex: 1 }}>{fam.name}</p>
                <p style={{ fontSize: 13, color: TEXT_SECONDARY, margin: 0 }}>{fam.opened ? fam.time : 'Not opened'}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const CommunicationVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      {/* Title — 0s–7s */}
      <Sequence from={0} durationInFrames={sec(7)}>
        <TitleCard title="Communication That Works" subtitle="Professional newsletters in minutes, not hours" />
      </Sequence>

      {/* Builder — 7s–16s */}
      <Sequence from={sec(7)} durationInFrames={sec(9)}>
        <NewsletterBuilderScene />
        <NarrationText text="Pick a title, drop in your sections, and write. The builder handles layout and branding automatically." />
      </Sequence>

      {/* Reorder — 16s–25s */}
      <Sequence from={sec(16)} durationInFrames={sec(9)}>
        <ReorderScene />
        <NarrationText text="Drag sections into any order. Every rearrangement updates the preview in real time." />
      </Sequence>

      {/* Export — 25s–34s */}
      <Sequence from={sec(25)} durationInFrames={sec(9)}>
        <BrandedPreviewScene />
        <NarrationText text="When you are happy with it, export a PDF, email it, or send a push notification — or all three at once." />
      </Sequence>

      {/* Analytics — 34s–43s */}
      <Sequence from={sec(34)} durationInFrames={sec(9)}>
        <EngagementScene />
        <NarrationText text="Track which families actually opened it. Follow up with the ones who haven't, before they feel left out." style="tip" />
      </Sequence>

      {/* Outro — 43s–50s */}
      <Sequence from={sec(43)} durationInFrames={sec(7)}>
        <TitleCard
          title="Families who feel informed stay enrolled."
          subtitle="Build that trust every single week"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
