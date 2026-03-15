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

// ─── Scene: Enrollment funnel ─────────────────────────────────────────────────

const EnrollmentFunnelScene: React.FC = () => {
  const frame = useCurrentFrame();

  const funnel = [
    { label: 'Inquiries', count: 48, color: '#3b82f6', pct: 100 },
    { label: 'Tours Scheduled', count: 31, color: '#7c3aed', pct: 65 },
    { label: 'Applications', count: 22, color: '#0891b2', pct: 46 },
    { label: 'Enrolled', count: 18, color: '#16a34a', pct: 38 },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 44 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Enrollment Funnel</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>See exactly where families drop off and where to focus</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 700 }}>
        {funnel.map((stage, i) => {
          const barWidth = interpolate(frame, [18 + i * 14, 44 + i * 14], [0, stage.pct], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const textOpacity = interpolate(frame, [28 + i * 14, 44 + i * 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={stage.label} style={{ width: '100%' }}>
              {/* Label + count */}
              <div style={{ opacity: textOpacity, display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 16, color: 'white', fontWeight: 600 }}>{stage.label}</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: stage.color }}>{stage.count}</span>
                  <span style={{ fontSize: 14, color: TEXT_SECONDARY }}>{stage.pct}% of inquiries</span>
                </div>
              </div>
              {/* Bar */}
              <div style={{ height: 44, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${barWidth}%`, height: '100%', background: stage.color, borderRadius: 10, opacity: 0.85 }} />
              </div>

              {/* Conversion rate between stages */}
              {i < funnel.length - 1 && (
                <div style={{ opacity: textOpacity, display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: TEXT_SECONDARY }}>
                    → {Math.round((funnel[i + 1].count / stage.count) * 100)}% convert to next step
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Revenue forecast + cash flow ──────────────────────────────────────

const RevenueForecastScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Monthly revenue data (last 6 months + 3 projected)
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr*', 'May*', 'Jun*'];
  const actuals = [28400, 29100, 27800, 30200, 31500, 32100];
  const projected = [33200, 34000, 34800];
  const maxValue = 40000;

  const chartOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });

  const chartHeight = 220;

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Revenue Forecast</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Cash flow visibility 90 days out</p>
      </div>

      {/* Chart */}
      <div style={{ opacity: chartOpacity, width: 860, background: CARD_BG, border: CARD_BORDER, borderRadius: 20, padding: '28px 32px' }}>
        {/* Y-axis labels + bars */}
        <div style={{ position: 'relative', height: chartHeight, display: 'flex', alignItems: 'flex-end', gap: 16, paddingBottom: 0 }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((tick) => (
            <div key={tick} style={{ position: 'absolute', left: 0, right: 0, bottom: `${tick * 100}%`, height: 1, background: 'rgba(255,255,255,0.06)' }}>
              <span style={{ position: 'absolute', right: '100%', paddingRight: 8, fontSize: 11, color: TEXT_SECONDARY, transform: 'translateY(50%)' }}>
                ${(maxValue * tick / 1000).toFixed(0)}k
              </span>
            </div>
          ))}

          {/* Actual bars */}
          {actuals.map((val, i) => {
            const barH = interpolate(frame, [20 + i * 6, 44 + i * 6], [0, (val / maxValue) * chartHeight], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                <div style={{ width: '100%', height: barH, background: BRAND_RED, borderRadius: '6px 6px 0 0', opacity: 0.9 }} />
              </div>
            );
          })}

          {/* Projected bars */}
          {projected.map((val, i) => {
            const barH = interpolate(frame, [56 + i * 6, 76 + i * 6], [0, (val / maxValue) * chartHeight], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                <div style={{ width: '100%', height: barH, background: BRAND_RED, borderRadius: '6px 6px 0 0', opacity: 0.35, border: `2px dashed ${BRAND_RED}`, borderBottom: 'none' }} />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          {months.map((m, i) => (
            <div key={m} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: i >= 6 ? BRAND_RED : TEXT_SECONDARY, fontWeight: i >= 6 ? 700 : 400 }}>
              {m}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 24, marginTop: 18, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: BRAND_RED }} />
            <span style={{ fontSize: 13, color: TEXT_SECONDARY }}>Actual revenue</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: 'transparent', border: `2px dashed ${BRAND_RED}` }} />
            <span style={{ fontSize: 13, color: TEXT_SECONDARY }}>Projected</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Scenario modeling ─────────────────────────────────────────────────

const ScenarioModelingScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Slide enrollment from 28 to 34
  const enrollmentValue = Math.round(interpolate(frame, [35, 80], [28, 34], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const revenueValue = Math.round(interpolate(frame, [35, 80], [28400, 34000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const impactValue = revenueValue - 28400;

  const sliderPct = interpolate(frame, [35, 80], [47, 80], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 44 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Scenario Modeling</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>What happens to revenue if you fill two more slots?</p>
      </div>

      <div style={{ width: 700, display: 'flex', flexDirection: 'column', gap: 36 }}>
        {/* Enrollment slider */}
        <div style={{ ...useFadeUp(frame, 14), background: CARD_BG, border: CARD_BORDER, borderRadius: 20, padding: '28px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: 0 }}>Enrolled Children</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: BRAND_RED, margin: 0, lineHeight: 1 }}>{enrollmentValue}</p>
          </div>

          {/* Slider track */}
          <div style={{ position: 'relative', height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 10 }}>
            <div style={{ width: `${sliderPct}%`, height: '100%', background: BRAND_RED, borderRadius: 6 }} />
            {/* Thumb */}
            <div style={{ position: 'absolute', top: '50%', left: `${sliderPct}%`, transform: 'translate(-50%, -50%)', width: 26, height: 26, borderRadius: '50%', background: BRAND_RED, border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: TEXT_SECONDARY }}>Min: 15</span>
            <span style={{ fontSize: 13, color: TEXT_SECONDARY }}>Capacity: 42</span>
          </div>
        </div>

        {/* Revenue impact */}
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ ...useFadeUp(frame, 25), flex: 1, background: CARD_BG, border: CARD_BORDER, borderRadius: 16, padding: '20px 24px' }}>
            <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Monthly Revenue</p>
            <p style={{ fontSize: 38, fontWeight: 900, color: 'white', margin: 0 }}>${revenueValue.toLocaleString()}</p>
          </div>
          <div style={{ ...useFadeUp(frame, 35), flex: 1, background: impactValue > 0 ? 'rgba(34,197,94,0.08)' : CARD_BG, border: impactValue > 0 ? '1px solid rgba(34,197,94,0.3)' : CARD_BORDER, borderRadius: 16, padding: '20px 24px' }}>
            <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>vs. Current</p>
            <p style={{ fontSize: 38, fontWeight: 900, color: impactValue > 0 ? '#4ade80' : BRAND_RED, margin: 0 }}>
              {impactValue > 0 ? '+' : ''}{impactValue > 0 ? `$${impactValue.toLocaleString()}` : `-$${Math.abs(impactValue).toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Cross-site operations ─────────────────────────────────────────────

const CrossSiteScene: React.FC = () => {
  const frame = useCurrentFrame();

  const sites = [
    {
      name: 'Crystal Center',
      address: '5510 W Broadway Ave',
      enrolled: 32,
      capacity: 40,
      revenue: 32100,
      staff: 9,
      color: BRAND_RED,
    },
    {
      name: 'Brooklyn Park Center',
      address: '7201 Noble Ave N',
      enrolled: 24,
      capacity: 35,
      revenue: 24600,
      staff: 7,
      color: '#7c3aed',
    },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 44 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Multi-Site Operations</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Two centers, one dashboard, one clear picture</p>
      </div>

      <div style={{ display: 'flex', gap: 40 }}>
        {sites.map((site, si) => {
          const cardOpacity = interpolate(frame, [15 + si * 20, 30 + si * 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const cardX = interpolate(frame, [15 + si * 20, 30 + si * 20], [si === 0 ? -30 : 30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const occupancyPct = (site.enrolled / site.capacity) * 100;
          const barWidth = interpolate(frame, [30 + si * 20, 70 + si * 20], [0, occupancyPct], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={site.name} style={{ opacity: cardOpacity, transform: `translateX(${cardX}px)`, width: 380, background: CARD_BG, border: `1px solid ${site.color}40`, borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Site header */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${site.color}22`, border: `1px solid ${site.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  🏠
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>{site.name}</p>
                  <p style={{ fontSize: 13, color: TEXT_SECONDARY, margin: '2px 0 0' }}>{site.address}</p>
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Enrolled', value: `${site.enrolled}/${site.capacity}`, highlight: true },
                  { label: 'Staff', value: `${site.staff}`, highlight: false },
                  { label: 'Monthly Revenue', value: `$${(site.revenue / 1000).toFixed(1)}k`, highlight: true },
                  { label: 'Occupancy', value: `${Math.round(occupancyPct)}%`, highlight: false },
                ].map((metric) => (
                  <div key={metric.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 14px' }}>
                    <p style={{ fontSize: 12, color: TEXT_SECONDARY, margin: '0 0 4px' }}>{metric.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: metric.highlight ? site.color : 'white', margin: 0 }}>{metric.value}</p>
                  </div>
                ))}
              </div>

              {/* Occupancy bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 13, color: TEXT_SECONDARY, margin: 0 }}>Occupancy</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: site.color, margin: 0 }}>{Math.round(occupancyPct)}%</p>
                </div>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${barWidth}%`, height: '100%', background: site.color, borderRadius: 5 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const BusinessIntelligenceVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      {/* Title — 0s–7s */}
      <Sequence from={0} durationInFrames={sec(7)}>
        <TitleCard title="See Your Business Clearly" subtitle="Data-driven decisions, not guesswork" />
      </Sequence>

      {/* Enrollment funnel — 7s–16s */}
      <Sequence from={sec(7)} durationInFrames={sec(9)}>
        <EnrollmentFunnelScene />
        <NarrationText text="The enrollment funnel shows where families drop off between inquiry and enrollment — so you know where to improve." />
      </Sequence>

      {/* Revenue forecast — 16s–25s */}
      <Sequence from={sec(16)} durationInFrames={sec(9)}>
        <RevenueForecastScene />
        <NarrationText text="Six months of actuals plus a 90-day cash flow projection. See what is coming before it arrives." />
      </Sequence>

      {/* Scenario modeling — 25s–34s */}
      <Sequence from={sec(25)} durationInFrames={sec(9)}>
        <ScenarioModelingScene />
        <NarrationText text="Slide enrollment up or down and watch the revenue number change in real time. Model any scenario before you commit." style="callout" />
      </Sequence>

      {/* Cross-site — 34s–43s */}
      <Sequence from={sec(34)} durationInFrames={sec(9)}>
        <CrossSiteScene />
        <NarrationText text="Running two locations? Both appear side by side. One login, full visibility across everything you own." />
      </Sequence>

      {/* Outro — 43s–50s */}
      <Sequence from={sec(43)} durationInFrames={sec(7)}>
        <TitleCard
          title="Run your center on facts, not feelings."
          subtitle="Business Intelligence is available in your Admin dashboard"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
