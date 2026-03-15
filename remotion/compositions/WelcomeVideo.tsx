import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TitleCard } from '../components/TitleCard';
import { NarrationText } from '../components/NarrationText';

// ─── Shared helpers ───────────────────────────────────────────────────────────

const BRAND_RED = '#C62828';
const BG_DARK = '#1a1a2e';
const TEXT_SECONDARY = '#94a3b8';

// Fade + slide-up entrance relative to local frame
function useFadeUp(frame: number, start: number, distance = 40) {
  const opacity = interpolate(frame, [start, start + 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(frame, [start, start + 24], [distance, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return { opacity, transform: `translateY(${y}px)` };
}

// ─── Scene 2: Portal icons ────────────────────────────────────────────────────

const PortalIconsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const portals = [
    { label: 'Parent Portal', icon: '👨‍👩‍👧', desc: 'Photos · Newsletters · Messages', delay: 0 },
    { label: 'Employee Portal', icon: '👷', desc: 'Clock In · Meal Count · Tasks', delay: 18 },
    { label: 'Admin Portal', icon: '🏢', desc: 'Dashboard · Scheduling · Compliance', delay: 36 },
  ];

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const headerY = interpolate(frame, [0, 20], [-30, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 60 }}>
      {/* Decorative background circles */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, rgba(198,40,40,0.12) 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, rgba(198,40,40,0.08) 0%, transparent 70%)` }} />

      <div style={{ opacity: headerOpacity, transform: `translateY(${headerY}px)`, textAlign: 'center' }}>
        <h2 style={{ fontSize: 52, fontWeight: 700, color: 'white', margin: 0 }}>Three portals. One platform.</h2>
        <p style={{ fontSize: 28, color: TEXT_SECONDARY, margin: '16px 0 0' }}>Every role in your center, covered.</p>
      </div>

      <div style={{ display: 'flex', gap: 48 }}>
        {portals.map((portal) => {
          const s = spring({ frame: frame - portal.delay, fps, config: { damping: 18, stiffness: 90 } });
          const portalOpacity = interpolate(frame - portal.delay, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const scale = interpolate(s, [0, 1], [0.7, 1]);
          return (
            <div key={portal.label} style={{ opacity: portalOpacity, transform: `scale(${scale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: 280 }}>
              <div style={{ width: 120, height: 120, borderRadius: 32, background: 'rgba(198,40,40,0.15)', border: `2px solid rgba(198,40,40,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>
                {portal.icon}
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: 'white', margin: '0 0 8px' }}>{portal.label}</p>
                <p style={{ fontSize: 16, color: TEXT_SECONDARY, margin: 0 }}>{portal.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Parent highlights ───────────────────────────────────────────────

const ParentHighlightsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const features = [
    { icon: '📸', title: 'Daily Photos', desc: 'Real-time photos from the classroom, every day' },
    { icon: '📰', title: 'Newsletters', desc: 'Weekly updates on what your child is learning' },
    { icon: '💬', title: 'Direct Messages', desc: 'Instant communication with teachers and staff' },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 56 }}>
      <div style={useFadeUp(frame, 0)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 8, height: 48, background: BRAND_RED, borderRadius: 4 }} />
          <h2 style={{ fontSize: 48, fontWeight: 700, color: 'white', margin: 0 }}>Parent Portal</h2>
        </div>
        <p style={{ fontSize: 24, color: TEXT_SECONDARY, margin: '0 0 0 24px' }}>What families see when they log in</p>
      </div>

      <div style={{ display: 'flex', gap: 40 }}>
        {features.map((f, i) => {
          const fade = useFadeUp(frame, 20 + i * 15);
          return (
            <div key={f.title} style={{ ...fade, width: 320, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 48 }}>{f.icon}</div>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>{f.title}</p>
              <p style={{ fontSize: 16, color: TEXT_SECONDARY, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Employee highlights ────────────────────────────────────────────

const EmployeeHighlightsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const features = [
    { icon: '⏱️', title: 'Clock In/Out', desc: 'Quick PIN-based time tracking from any device' },
    { icon: '🍽️', title: 'Meal Count', desc: 'Submit counts in under 15 seconds' },
    { icon: '✅', title: 'Daily Tasks', desc: 'Nap time, diapering, and classroom checklists' },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 56 }}>
      <div style={useFadeUp(frame, 0)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 8, height: 48, background: BRAND_RED, borderRadius: 4 }} />
          <h2 style={{ fontSize: 48, fontWeight: 700, color: 'white', margin: 0 }}>Employee Portal</h2>
        </div>
        <p style={{ fontSize: 24, color: TEXT_SECONDARY, margin: '0 0 0 24px' }}>What staff do every single shift</p>
      </div>

      <div style={{ display: 'flex', gap: 40 }}>
        {features.map((f, i) => {
          const fade = useFadeUp(frame, 20 + i * 15);
          return (
            <div key={f.title} style={{ ...fade, width: 320, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 48 }}>{f.icon}</div>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>{f.title}</p>
              <p style={{ fontSize: 16, color: TEXT_SECONDARY, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: Admin highlights ────────────────────────────────────────────────

const AdminHighlightsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const features = [
    { icon: '📊', title: 'Live Dashboard', desc: 'Real-time attendance, ratios, and alerts' },
    { icon: '📅', title: 'Scheduling', desc: 'Build compliant schedules in minutes, not hours' },
    { icon: '📋', title: 'Compliance', desc: 'CACFP, licensing, and audit-ready reports' },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 56 }}>
      <div style={useFadeUp(frame, 0)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 8, height: 48, background: BRAND_RED, borderRadius: 4 }} />
          <h2 style={{ fontSize: 48, fontWeight: 700, color: 'white', margin: 0 }}>Admin Portal</h2>
        </div>
        <p style={{ fontSize: 24, color: TEXT_SECONDARY, margin: '0 0 0 24px' }}>Where directors run the whole operation</p>
      </div>

      <div style={{ display: 'flex', gap: 40 }}>
        {features.map((f, i) => {
          const fade = useFadeUp(frame, 20 + i * 15);
          return (
            <div key={f.title} style={{ ...fade, width: 320, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 48 }}>{f.icon}</div>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>{f.title}</p>
              <p style={{ fontSize: 16, color: TEXT_SECONDARY, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const WelcomeVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      {/* Scene 1: Title card — 0:00–10s */}
      <Sequence from={0} durationInFrames={sec(10)}>
        <TitleCard
          title="Welcome to Christina's Child Care Center"
          subtitle="Your all-in-one childcare management platform"
        />
      </Sequence>

      {/* Scene 2: Three portals — 10s–20s */}
      <Sequence from={sec(10)} durationInFrames={sec(10)}>
        <PortalIconsScene />
        <NarrationText text="Christina's gives every role in your center its own purpose-built portal." />
      </Sequence>

      {/* Scene 3: Parent portal — 20s–30s */}
      <Sequence from={sec(20)} durationInFrames={sec(10)}>
        <ParentHighlightsScene />
        <NarrationText text="Parents stay connected through daily photos, newsletters, and direct messages." />
      </Sequence>

      {/* Scene 4: Employee portal — 30s–40s */}
      <Sequence from={sec(30)} durationInFrames={sec(10)}>
        <EmployeeHighlightsScene />
        <NarrationText text="Employees clock in, submit meal counts, and complete tasks — all from their phone." />
      </Sequence>

      {/* Scene 5: Admin portal — 40s–50s */}
      <Sequence from={sec(40)} durationInFrames={sec(10)}>
        <AdminHighlightsScene />
        <NarrationText text="Admins see the live dashboard, build schedules, and stay audit-ready at all times." />
      </Sequence>

      {/* Scene 6: Closing — 50s–60s */}
      <Sequence from={sec(50)} durationInFrames={sec(10)}>
        <TitleCard
          title="Let's get started."
          subtitle="Choose your portal below to begin your training"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
