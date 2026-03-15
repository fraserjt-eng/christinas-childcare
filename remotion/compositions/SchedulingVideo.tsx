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

// Staff + shift data shared across scenes
const STAFF = [
  { name: 'Maria Santos', initials: 'MS', color: '#0891b2' },
  { name: 'James Robinson', initials: 'JR', color: '#7c3aed' },
  { name: 'Priya Patel', initials: 'PP', color: '#16a34a' },
  { name: 'Devon Clark', initials: 'DC', color: '#b45309' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const SCHEDULE_DATA: Record<string, string[]> = {
  'Maria Santos': ['7:00–3:00', '7:00–3:00', 'OFF', '9:00–5:00', '7:00–3:00'],
  'James Robinson': ['9:00–5:00', 'OFF', '7:00–3:00', '7:00–3:00', '9:00–5:00'],
  'Priya Patel': ['OFF', '7:00–3:00', '9:00–5:00', '7:00–3:00', 'OFF'],
  'Devon Clark': ['7:00–3:00', '9:00–5:00', '7:00–3:00', 'OFF', '7:00–3:00'],
};

// ─── Scene: Drag-and-drop board ───────────────────────────────────────────────

const ScheduleBoardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerFade = useFadeUp(frame, 0);

  // Animate a "dragged" shift block
  const dragX = interpolate(frame, [50, 85], [0, 160], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dragY = interpolate(frame, [50, 85], [0, -60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dragScale = interpolate(frame, [50, 60, 85, 90], [1, 1.08, 1.08, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dragShadow = interpolate(frame, [50, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const tableOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={headerFade}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Drag-and-Drop Schedule Board</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Preset shift blocks snap into place</p>
      </div>

      <div style={{ opacity: tableOpacity, background: 'rgba(255,255,255,0.03)', border: CARD_BORDER, borderRadius: 20, overflow: 'hidden', width: 900 }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(5, 1fr)', background: 'rgba(255,255,255,0.05)', borderBottom: CARD_BORDER }}>
          <div style={{ padding: '12px 16px', fontSize: 13, color: TEXT_SECONDARY, fontWeight: 600 }}>Staff</div>
          {DAYS.map((d) => (
            <div key={d} style={{ padding: '12px 0', fontSize: 14, fontWeight: 700, color: 'white', textAlign: 'center' }}>{d}</div>
          ))}
        </div>

        {/* Staff rows */}
        {STAFF.map((s, si) => (
          <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '160px repeat(5, 1fr)', borderBottom: si < STAFF.length - 1 ? CARD_BORDER : 'none' }}>
            {/* Name cell */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {s.initials}
              </div>
              <p style={{ fontSize: 13, color: 'white', margin: 0 }}>{s.name.split(' ')[0]}</p>
            </div>
            {/* Shift cells */}
            {SCHEDULE_DATA[s.name].map((shift, di) => {
              const isOff = shift === 'OFF';
              // Animated drag on Maria's Wednesday cell
              const isDragged = si === 0 && di === 2;
              return (
                <div key={di} style={{ padding: '8px 6px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{
                    padding: '6px 0',
                    borderRadius: 8,
                    width: '100%',
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    background: isDragged ? 'transparent' : isOff ? 'rgba(255,255,255,0.03)' : `${s.color}22`,
                    color: isDragged ? 'transparent' : isOff ? TEXT_SECONDARY : 'white',
                    border: isDragged ? '2px dashed rgba(255,255,255,0.15)' : 'none',
                    ...(isDragged ? {} : {}),
                  }}>
                    {isDragged ? '' : shift}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Floating dragged block */}
      <div style={{
        position: 'absolute',
        top: 420,
        left: 440,
        transform: `translate(${dragX}px, ${dragY}px) scale(${dragScale})`,
        opacity: interpolate(frame, [45, 55, 95, 105], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        background: '#0891b2',
        borderRadius: 8,
        padding: '6px 18px',
        fontSize: 13,
        fontWeight: 700,
        color: 'white',
        boxShadow: `0 ${8 * dragShadow}px ${24 * dragShadow}px rgba(0,0,0,0.4)`,
        cursor: 'grab',
      }}>
        7:00–3:00
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Copy last week ────────────────────────────────────────────────────

const CopyWeekScene: React.FC = () => {
  const frame = useCurrentFrame();

  const buttonPulse = interpolate(frame, [30, 45, 55, 70], [1, 0.95, 1.05, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const successOpacity = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const successY = interpolate(frame, [75, 90], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 48 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Copy Last Week</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>One button. Entire schedule reproduced.</p>
      </div>

      {/* Weeks side by side */}
      <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
        {/* Last week */}
        <div style={{ ...useFadeUp(frame, 10), textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Week of Mar 9</p>
          <div style={{ width: 240, background: CARD_BG, border: CARD_BORDER, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STAFF.slice(0, 3).map((s) => (
              <div key={s.name} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: TEXT_SECONDARY, margin: 0 }}>{s.name.split(' ')[0]}: Mon–Fri</p>
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ ...useFadeUp(frame, 25), transform: `scale(${buttonPulse})`, background: BRAND_RED, borderRadius: 20, padding: '18px 40px', fontSize: 18, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 8px 32px rgba(198,40,40,0.4)` }}>
            Copy to Mar 16 →
          </div>
        </div>

        {/* This week */}
        <div style={{ opacity: successOpacity, transform: `translateY(${successY}px)`, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#4ade80', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Week of Mar 16 — Copied!</p>
          <div style={{ width: 240, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STAFF.slice(0, 3).map((s) => (
              <div key={s.name} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: '#86efac', margin: 0 }}>{s.name.split(' ')[0]}: Mon–Fri</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Ratio compliance ──────────────────────────────────────────────────

const RatioCheckScene: React.FC = () => {
  const frame = useCurrentFrame();

  const rooms = [
    { name: 'Infants (0–12 mo)', ratio: '1:4', staff: 2, children: 7, status: 'ok' },
    { name: 'Toddlers (12–24 mo)', ratio: '1:7', staff: 2, children: 12, status: 'ok' },
    { name: 'Preschool (3–5 yr)', ratio: '1:10', staff: 2, children: 18, status: 'ok' },
    { name: 'School Age (5+)', ratio: '1:15', staff: 1, children: 8, status: 'ok' },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Ratio Compliance Check</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Every room verified against MN licensing rules</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 700 }}>
        {rooms.map((room, i) => {
          const rowOpacity = interpolate(frame, [15 + i * 12, 30 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const rowX = interpolate(frame, [15 + i * 12, 30 + i * 12], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const checkScale = spring({ frame: frame - (25 + i * 12), fps: 30, config: { damping: 12, stiffness: 200 } });
          return (
            <div key={room.name} style={{ opacity: rowOpacity, transform: `translateX(${rowX}px)`, display: 'flex', alignItems: 'center', gap: 20, background: CARD_BG, border: CARD_BORDER, borderRadius: 16, padding: '16px 24px' }}>
              <div style={{ transform: `scale(${checkScale})`, width: 36, height: 36, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white', flexShrink: 0 }}>
                ✓
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'white', margin: '0 0 2px' }}>{room.name}</p>
                <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: 0 }}>Required ratio: {room.ratio}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#4ade80', margin: 0 }}>{room.staff} staff / {room.children} children</p>
                <p style={{ fontSize: 13, color: '#4ade80', margin: 0 }}>Compliant</p>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: PDF export + publish ─────────────────────────────────────────────

const ExportPublishScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pdfScale = spring({ frame: frame - 20, fps, config: { damping: 16, stiffness: 90 } });
  const publishOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 48 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Export and Publish</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>One click to PDF, one click to staff phones</p>
      </div>

      <div style={{ display: 'flex', gap: 40 }}>
        {/* PDF button */}
        <div style={{ transform: `scale(${interpolate(pdfScale, [0, 1], [0.8, 1])})`, opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateRight: 'clamp' }) }}>
          <div style={{ width: 260, background: CARD_BG, border: CARD_BORDER, borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 56 }}>📄</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: '0 0 6px' }}>Export PDF</p>
              <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: 0 }}>Print-ready schedule for your files</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 28px', fontSize: 15, color: 'white', fontWeight: 600 }}>
              Download PDF
            </div>
          </div>
        </div>

        {/* Publish button */}
        <div style={{ opacity: publishOpacity, transform: `translateY(${interpolate(frame, [60, 80], [20, 0], { extrapolateRight: 'clamp' })}px)` }}>
          <div style={{ width: 260, background: `rgba(198,40,40,0.1)`, border: `1px solid ${BRAND_RED}60`, borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 56 }}>📲</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: '0 0 6px' }}>Publish to Staff</p>
              <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: 0 }}>Notifies all staff instantly via app</p>
            </div>
            <div style={{ background: BRAND_RED, borderRadius: 12, padding: '10px 28px', fontSize: 15, color: 'white', fontWeight: 700 }}>
              Publish Now
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const SchedulingVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      {/* Title — 0s–7s */}
      <Sequence from={0} durationInFrames={sec(7)}>
        <TitleCard title="Scheduling Made Easy" subtitle="From a 30-minute chore to a 5-minute task" />
      </Sequence>

      {/* Board — 7s–16s */}
      <Sequence from={sec(7)} durationInFrames={sec(9)}>
        <ScheduleBoardScene />
        <NarrationText text="Drag preset shift blocks onto the grid. Positions snap into place — no typing times manually." />
      </Sequence>

      {/* Copy week — 16s–25s */}
      <Sequence from={sec(16)} durationInFrames={sec(9)}>
        <CopyWeekScene />
        <NarrationText text="Most weeks look the same. Hit 'Copy Last Week' and you're 90% done in one click." style="callout" />
      </Sequence>

      {/* Ratio check — 25s–34s */}
      <Sequence from={sec(25)} durationInFrames={sec(9)}>
        <RatioCheckScene />
        <NarrationText text="The system checks every room against Minnesota licensing ratios automatically. Green means go." />
      </Sequence>

      {/* Export + publish — 34s–43s */}
      <Sequence from={sec(34)} durationInFrames={sec(9)}>
        <ExportPublishScene />
        <NarrationText text="Export a PDF for your records, then publish to staff phones. Everyone knows their week instantly." />
      </Sequence>

      {/* Outro — 43s–50s */}
      <Sequence from={sec(43)} durationInFrames={sec(7)}>
        <TitleCard
          title="Five minutes. Done."
          subtitle="Scheduling used to take your whole lunch break. Not anymore."
        />
      </Sequence>
    </AbsoluteFill>
  );
};
