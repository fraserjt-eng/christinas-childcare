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

// ─── Scene: Knowledge base ────────────────────────────────────────────────────

const KnowledgeBaseScene: React.FC = () => {
  const frame = useCurrentFrame();

  const articles = [
    { icon: '🚨', title: 'Emergency Procedures', category: 'Safety', views: 42 },
    { icon: '🍽️', title: 'CACFP Meal Requirements', category: 'Compliance', views: 38 },
    { icon: '🧸', title: 'Infant Room Setup Standards', category: 'Licensing', views: 27 },
    { icon: '💊', title: 'Medication Administration Policy', category: 'Health', views: 19 },
    { icon: '📱', title: 'How to Submit Meal Counts', category: 'Operations', views: 55 },
    { icon: '😴', title: 'Safe Sleep Policy', category: 'Licensing', views: 34 },
  ];

  // Simulate search bar typing
  const searchTerm = 'meal';
  const searchProgress = interpolate(frame, [30, 55], [0, searchTerm.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const typedSearch = searchTerm.slice(0, Math.round(searchProgress));
  const filteredArticles = typedSearch.length > 0
    ? articles.filter((a) => a.title.toLowerCase().includes(typedSearch) || a.category.toLowerCase().includes(typedSearch))
    : articles;

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 36 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Knowledge Base</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Every procedure, policy, and how-to in one searchable place</p>
      </div>

      {/* Search bar */}
      <div style={{ ...useFadeUp(frame, 14), width: 640, display: 'flex', gap: 0 }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px 0 0 12px', padding: '13px 18px', fontSize: 16, color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: TEXT_SECONDARY }}>🔍</span>
          <span>{typedSearch || 'Search procedures...'}</span>
          {typedSearch.length > 0 && typedSearch.length < searchTerm.length && (
            <span style={{ opacity: frame % 20 < 10 ? 1 : 0, color: BRAND_RED }}>|</span>
          )}
        </div>
        <div style={{ background: BRAND_RED, borderRadius: '0 12px 12px 0', padding: '13px 20px', fontSize: 16, color: 'white', fontWeight: 600 }}>
          Search
        </div>
      </div>

      {/* Article grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, width: 800 }}>
        {(typedSearch.length > 1 ? filteredArticles : articles).slice(0, 6).map((article, i) => {
          const cardOpacity = interpolate(frame, [20 + i * 7, 34 + i * 7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const isHighlighted = typedSearch.length > 1 && (article.title.toLowerCase().includes(typedSearch) || article.category.toLowerCase().includes(typedSearch));
          return (
            <div key={article.title} style={{ opacity: cardOpacity, background: isHighlighted ? 'rgba(198,40,40,0.1)' : CARD_BG, border: isHighlighted ? `1px solid ${BRAND_RED}50` : CARD_BORDER, borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{article.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: '0 0 4px', lineHeight: 1.3 }}>{article.title}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: BRAND_RED, background: 'rgba(198,40,40,0.1)', padding: '2px 8px', borderRadius: 6 }}>{article.category}</span>
                <span style={{ fontSize: 12, color: TEXT_SECONDARY }}>{article.views} views</span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Onboarding pathway ────────────────────────────────────────────────

const OnboardingPathwayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phases = [
    { label: 'Phase 1', name: 'Day 1 Essentials', items: ['Safety tour', 'Emergency procedures', 'Clock-in system'], complete: 4, total: 4 },
    { label: 'Phase 2', name: 'Your Classroom', items: ['Ratio requirements', 'Daily schedule', 'Curriculum access'], complete: 3, total: 4 },
    { label: 'Phase 3', name: 'CACFP & Compliance', items: ['Meal count training', 'USDA rules', 'Documentation'], complete: 1, total: 4 },
    { label: 'Phase 4', name: 'Growth & Development', items: ['CDA pathway', 'Observation practice', 'Peer mentoring'], complete: 0, total: 4 },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Onboarding Pathway</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>New staff know exactly where they are and what comes next</p>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {phases.map((phase, i) => {
          const phaseFade = interpolate(frame, [18 + i * 12, 32 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const phaseY = interpolate(frame, [18 + i * 12, 32 + i * 12], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const isActive = i === 1;
          const isDone = i === 0;
          const pctFill = isDone ? 100 : isActive ? 75 : i === 2 ? 25 : 0;

          return (
            <div key={phase.label} style={{ opacity: phaseFade, transform: `translateY(${phaseY}px)`, width: 220, background: isDone ? 'rgba(34,197,94,0.07)' : isActive ? 'rgba(198,40,40,0.08)' : CARD_BG, border: isDone ? '1px solid rgba(34,197,94,0.3)' : isActive ? `1px solid ${BRAND_RED}50` : CARD_BORDER, borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Phase header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: isDone ? '#4ade80' : isActive ? BRAND_RED : TEXT_SECONDARY, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{phase.label}</span>
                {isDone && <span style={{ fontSize: 18 }}>✅</span>}
                {isActive && <span style={{ width: 10, height: 10, borderRadius: '50%', background: BRAND_RED, display: 'block', boxShadow: `0 0 8px ${BRAND_RED}` }} />}
              </div>

              <p style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.3 }}>{phase.name}</p>

              {/* Progress bar */}
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pctFill}%`, height: '100%', background: isDone ? '#4ade80' : BRAND_RED, borderRadius: 3 }} />
              </div>
              <p style={{ fontSize: 13, color: TEXT_SECONDARY, margin: 0 }}>{phase.complete}/{phase.total} complete</p>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {phase.items.map((item, ii) => (
                  <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: ii < phase.complete ? '#4ade80' : 'rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white' }}>
                      {ii < phase.complete ? '✓' : ''}
                    </div>
                    <p style={{ fontSize: 13, color: ii < phase.complete ? TEXT_SECONDARY : 'white', margin: 0, textDecoration: ii < phase.complete ? 'line-through' : 'none' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Certification tracker ────────────────────────────────────────────

const CertificationTrackerScene: React.FC = () => {
  const frame = useCurrentFrame();

  const staff = ['Maria S.', 'James R.', 'Priya P.', 'Devon C.', 'Keisha W.'];
  const certs = ['CPR/First Aid', 'CDA', 'Child Abuse', 'Fire Safety', 'SIDS Training'];

  // Status grid: green = current, yellow = expiring soon, red = expired, null = not required
  const statusGrid: Array<Array<'green' | 'yellow' | 'red' | null>> = [
    ['green', 'green', 'green', 'green', 'green'],
    ['green', 'yellow', 'green', 'green', 'green'],
    ['green', null, 'green', 'red', 'green'],
    ['yellow', 'green', 'green', 'green', null],
    ['green', 'green', 'red', 'green', 'green'],
  ];

  const statusColors: Record<string, string> = {
    green: '#16a34a',
    yellow: '#ca8a04',
    red: BRAND_RED,
  };

  const gridOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 36 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Certification Tracker</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>See every expiration across your whole team at once</p>
      </div>

      <div style={{ opacity: gridOpacity, background: 'rgba(255,255,255,0.03)', border: CARD_BORDER, borderRadius: 20, overflow: 'hidden', width: 820 }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(5, 1fr)', background: 'rgba(255,255,255,0.04)', borderBottom: CARD_BORDER }}>
          <div style={{ padding: '12px 16px', fontSize: 12, color: TEXT_SECONDARY, fontWeight: 600 }}>Staff</div>
          {certs.map((cert) => (
            <div key={cert} style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 1.3 }}>{cert}</div>
          ))}
        </div>

        {/* Staff rows */}
        {staff.map((person, si) => (
          <div key={person} style={{ display: 'grid', gridTemplateColumns: '140px repeat(5, 1fr)', borderBottom: si < staff.length - 1 ? CARD_BORDER : 'none' }}>
            <div style={{ padding: '12px 16px', fontSize: 14, color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center' }}>{person}</div>
            {statusGrid[si].map((status, ci) => {
              const cellScale = spring({ frame: frame - (20 + si * 8 + ci * 3), fps: 30, config: { damping: 14, stiffness: 200 } });
              return (
                <div key={ci} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
                  {status ? (
                    <div style={{ transform: `scale(${cellScale})`, width: 28, height: 28, borderRadius: 8, background: `${statusColors[status]}22`, border: `1px solid ${statusColors[status]}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                      {status === 'green' ? '✓' : status === 'yellow' ? '!' : '✗'}
                    </div>
                  ) : (
                    <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_SECONDARY, fontSize: 14 }}>—</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ ...useFadeUp(frame, 70), display: 'flex', gap: 28 }}>
        {[{ color: '#16a34a', label: 'Current' }, { color: '#ca8a04', label: 'Expiring soon' }, { color: BRAND_RED, label: 'Expired / missing' }].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: item.color }} />
            <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: 0 }}>{item.label}</p>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Training hours progress ──────────────────────────────────────────

const TrainingHoursScene: React.FC = () => {
  const frame = useCurrentFrame();

  const staff = [
    { name: 'Maria Santos', role: 'Lead Teacher', hours: 24, required: 30 },
    { name: 'James Robinson', role: 'Lead Teacher', hours: 30, required: 30 },
    { name: 'Priya Patel', role: 'Assistant', hours: 12, required: 15 },
    { name: 'Devon Clark', role: 'Assistant', hours: 8, required: 15 },
    { name: 'Keisha Williams', role: 'Aide', hours: 10, required: 10 },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Annual Training Hours</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Track every staff member against their licensing requirement</p>
      </div>

      <div style={{ width: 680, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {staff.map((person, i) => {
          const rowOpacity = interpolate(frame, [15 + i * 11, 28 + i * 11], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const pct = person.hours / person.required;
          const barWidth = interpolate(frame, [20 + i * 11, 65 + i * 11], [0, Math.min(100, pct * 100)], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const isComplete = person.hours >= person.required;
          const barColor = isComplete ? '#4ade80' : pct >= 0.6 ? '#fbbf24' : BRAND_RED;

          return (
            <div key={person.name} style={{ opacity: rowOpacity }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{person.name}</span>
                  <span style={{ fontSize: 14, color: TEXT_SECONDARY, marginLeft: 10 }}>{person.role}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: barColor }}>{person.hours}</span>
                  <span style={{ fontSize: 14, color: TEXT_SECONDARY }}>/ {person.required} hrs</span>
                  {isComplete && <span style={{ fontSize: 16 }}>✅</span>}
                </div>
              </div>
              <div style={{ height: 12, background: 'rgba(255,255,255,0.07)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${barWidth}%`, height: '100%', background: barColor, borderRadius: 6 }} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const StaffDevelopmentVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      {/* Title — 0s–7s */}
      <Sequence from={0} durationInFrames={sec(7)}>
        <TitleCard title="Build Your Team" subtitle="When staff grow, the center grows" />
      </Sequence>

      {/* Knowledge base — 7s–16s */}
      <Sequence from={sec(7)} durationInFrames={sec(9)}>
        <KnowledgeBaseScene />
        <NarrationText text="Every procedure your team needs is searchable in seconds. No more binders. No more asking around." />
      </Sequence>

      {/* Onboarding pathway — 16s–25s */}
      <Sequence from={sec(16)} durationInFrames={sec(9)}>
        <OnboardingPathwayScene />
        <NarrationText text="New hires follow a four-phase pathway. They always know what to do next on their first week." />
      </Sequence>

      {/* Cert tracker — 25s–34s */}
      <Sequence from={sec(25)} durationInFrames={sec(9)}>
        <CertificationTrackerScene />
        <NarrationText text="See every certification across your whole team on one screen. Expired or expiring cells turn red before licensing asks." style="callout" />
      </Sequence>

      {/* Training hours — 34s–43s */}
      <Sequence from={sec(34)} durationInFrames={sec(9)}>
        <TrainingHoursScene />
        <NarrationText text="Annual training hour requirements tracked per person. You'll know who needs hours before the renewal deadline." />
      </Sequence>

      {/* Outro — 43s–50s */}
      <Sequence from={sec(43)} durationInFrames={sec(7)}>
        <TitleCard
          title="A well-trained team is your strongest compliance asset."
          subtitle="Start building in the Staff Development module"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
