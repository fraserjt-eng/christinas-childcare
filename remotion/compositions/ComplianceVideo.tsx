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

// ─── Scene: Quick-fill meal counts ───────────────────────────────────────────

const QuickFillScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate "Copy Yesterday" button press then fill
  const buttonPressScale = interpolate(frame, [40, 47, 54], [1, 0.94, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rowsOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const meals = [
    { classroom: 'Little Stars (Infants)', breakfast: 8, lunch: 8, snack: 7 },
    { classroom: 'Toddler Room', breakfast: 12, lunch: 11, snack: 12 },
    { classroom: 'Preschool A', breakfast: 15, lunch: 15, snack: 14 },
    { classroom: 'Preschool B', breakfast: 13, lunch: 13, snack: 12 },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 36 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Quick-Fill Meal Counts</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>CACFP compliance in under a minute</p>
      </div>

      {/* Copy Yesterday button */}
      <div style={{ ...useFadeUp(frame, 18), display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ transform: `scale(${buttonPressScale})`, background: BRAND_RED, borderRadius: 14, padding: '14px 32px', fontSize: 17, fontWeight: 700, color: 'white', boxShadow: '0 6px 24px rgba(198,40,40,0.4)', cursor: 'pointer' }}>
          Copy Yesterday's Counts
        </div>
        <p style={{ fontSize: 15, color: TEXT_SECONDARY, margin: 0 }}>or enter manually below</p>
      </div>

      {/* Meal count table */}
      <div style={{ opacity: rowsOpacity, width: 760, background: 'rgba(255,255,255,0.03)', border: CARD_BORDER, borderRadius: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'rgba(255,255,255,0.04)', borderBottom: CARD_BORDER, padding: '12px 20px' }}>
          {['Classroom', 'Breakfast', 'Lunch', 'Snack'].map((h) => (
            <p key={h} style={{ fontSize: 13, fontWeight: 700, color: TEXT_SECONDARY, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</p>
          ))}
        </div>
        {meals.map((row, i) => (
          <div key={row.classroom} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: i < meals.length - 1 ? CARD_BORDER : 'none' }}>
            <p style={{ fontSize: 15, color: 'white', margin: 0 }}>{row.classroom}</p>
            {[row.breakfast, row.lunch, row.snack].map((count, ci) => (
              <div key={ci} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '4px 16px', fontSize: 15, fontWeight: 700, color: '#4ade80' }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Compliance rate + revenue impact ──────────────────────────────────

const ComplianceRateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rateValue = Math.round(interpolate(frame, [20, 65], [0, 97], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const revenueOpacity = interpolate(frame, [70, 88], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const arcProgress = interpolate(frame, [20, 65], [0, 0.97], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const circumference = 2 * Math.PI * 80;
  const dashOffset = circumference * (1 - arcProgress);

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 48 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>CACFP Compliance Rate</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Every completed count protects your reimbursement</p>
      </div>

      <div style={{ display: 'flex', gap: 60, alignItems: 'center' }}>
        {/* Circular rate meter */}
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
            {/* Progress arc */}
            <circle
              cx="100" cy="100" r="80"
              fill="none"
              stroke={BRAND_RED}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 44, fontWeight: 800, color: 'white', margin: 0, lineHeight: 1 }}>{rateValue}%</p>
            <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '4px 0 0' }}>compliance</p>
          </div>
        </div>

        {/* Revenue impact cards */}
        <div style={{ opacity: revenueOpacity, transform: `translateX(${interpolate(frame, [70, 88], [20, 0], { extrapolateRight: 'clamp' })}px)`, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: '18px 28px', width: 320 }}>
            <p style={{ fontSize: 14, color: '#4ade80', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Reimbursement</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: '#4ade80', margin: 0 }}>$4,872</p>
            <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '4px 0 0' }}>Based on 97% submission rate</p>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '18px 28px', width: 320 }}>
            <p style={{ fontSize: 14, color: '#f87171', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Missed at 80% Rate</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: '#f87171', margin: 0 }}>−$823 / mo</p>
            <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '4px 0 0' }}>Left on the table every month</p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: 16-item CACFP checklist ──────────────────────────────────────────

const CACFPChecklistScene: React.FC = () => {
  const frame = useCurrentFrame();

  const checklistItems = [
    'Meal counts submitted same day',
    'Infant formula records complete',
    'Menu meets USDA meal patterns',
    'Parent income forms on file',
    'Enrollment forms current',
    'Civil rights poster displayed',
    'Meal observation documented',
    'Supply invoices retained',
    'Attendance matches meal count',
    'Paid staff counts excluded',
    'Snack times within approved window',
    'Fluid milk offered at lunch',
    'Grain component portion correct',
    'Fruit or veg at each meal',
    'Sponsor monitoring visit logged',
    'Annual training hours met',
  ];

  // Items appear progressively
  const visibleCount = Math.round(interpolate(frame, [10, 100], [0, 16], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 32 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>CACFP Audit Checklist</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>16 requirements, auto-verified daily</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: 860 }}>
        {checklistItems.map((item, i) => {
          const isVisible = i < visibleCount;
          const checkScale = spring({ frame: frame - (10 + i * 5.5), fps: 30, config: { damping: 14, stiffness: 180 } });
          return (
            <div key={item} style={{ opacity: isVisible ? 1 : 0, display: 'flex', alignItems: 'center', gap: 14, background: CARD_BG, border: CARD_BORDER, borderRadius: 10, padding: '10px 16px' }}>
              <div style={{ transform: `scale(${checkScale})`, width: 22, height: 22, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', flexShrink: 0 }}>
                ✓
              </div>
              <p style={{ fontSize: 14, color: 'white', margin: 0 }}>{item}</p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Audit readiness score ────────────────────────────────────────────

const AuditScoreScene: React.FC = () => {
  const frame = useCurrentFrame();

  const score = Math.round(interpolate(frame, [15, 70], [0, 94], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const barWidth = interpolate(frame, [15, 70], [0, 94], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const categories = [
    { label: 'Meal Documentation', pct: 100 },
    { label: 'Enrollment Records', pct: 95 },
    { label: 'Menu Compliance', pct: 88 },
    { label: 'Training Hours', pct: 93 },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 44 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Audit Readiness Score</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Know where you stand before the auditor arrives</p>
      </div>

      {/* Big score */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <p style={{ fontSize: 120, fontWeight: 900, color: score >= 90 ? '#4ade80' : score >= 75 ? '#fbbf24' : '#f87171', margin: 0, lineHeight: 1 }}>{score}</p>
        <p style={{ fontSize: 40, color: TEXT_SECONDARY, margin: '0 0 18px' }}>/100</p>
      </div>

      {/* Category bars */}
      <div style={{ width: 640, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {categories.map((cat, i) => {
          const barOpacity = interpolate(frame, [30 + i * 10, 46 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const catWidth = interpolate(frame, [30 + i * 10, 70 + i * 10], [0, cat.pct], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={cat.label} style={{ opacity: barOpacity }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 15, color: 'white', margin: 0 }}>{cat.label}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#4ade80', margin: 0 }}>{cat.pct}%</p>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${catWidth}%`, height: '100%', background: '#4ade80', borderRadius: 5 }} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const ComplianceVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      {/* Title — 0s–7s */}
      <Sequence from={0} durationInFrames={sec(7)}>
        <TitleCard title="Revenue Protection & CACFP Compliance" subtitle="Every missed count costs money. Now none slip through." />
      </Sequence>

      {/* Quick-fill — 7s–16s */}
      <Sequence from={sec(7)} durationInFrames={sec(9)}>
        <QuickFillScene />
        <NarrationText text="Copy yesterday's counts with one button. Edit what changed. Submit. Done in under a minute." />
      </Sequence>

      {/* Compliance rate — 16s–25s */}
      <Sequence from={sec(16)} durationInFrames={sec(9)}>
        <ComplianceRateScene />
        <NarrationText text="Your compliance rate translates directly to dollars. A 17% drop in submissions means $823 lost every month." style="callout" />
      </Sequence>

      {/* 16-item checklist — 25s–34s */}
      <Sequence from={sec(25)} durationInFrames={sec(9)}>
        <CACFPChecklistScene />
        <NarrationText text="All 16 CACFP audit requirements are tracked automatically. Green down the list means you are covered." />
      </Sequence>

      {/* Audit score — 34s–43s */}
      <Sequence from={sec(34)} durationInFrames={sec(9)}>
        <AuditScoreScene />
        <NarrationText text="Your audit readiness score tells you exactly where to focus before an auditor ever walks in the door." />
      </Sequence>

      {/* Outro — 43s–50s */}
      <Sequence from={sec(43)} durationInFrames={sec(7)}>
        <TitleCard
          title="Protect every dollar you've earned."
          subtitle="CACFP compliance built into your daily routine"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
