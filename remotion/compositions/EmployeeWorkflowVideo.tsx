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

// ─── Scene: Clock-in PIN pad ──────────────────────────────────────────────────

const ClockInScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Simulate pin entry: digits appear progressively
  const pinDigits = ['●', '●', '●', '●'];
  const filledCount = Math.min(4, Math.floor(interpolate(frame, [20, 70], [0, 4], { extrapolateRight: 'clamp' })));

  const successOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardScale = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: -120, left: -120, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(198,40,40,0.1) 0%, transparent 70%)' }} />

      <div style={{ transform: `scale(${interpolate(cardScale, [0, 1], [0.9, 1])})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 }}>
        {/* Phone frame */}
        <div style={{ width: 380, background: '#0f172a', borderRadius: 36, padding: '40px 32px', border: '3px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
          {/* Header */}
          <p style={{ textAlign: 'center', fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Clock In</p>
          <p style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, color: 'white', margin: '0 0 32px' }}>Enter your PIN</p>

          {/* PIN dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 36 }}>
            {pinDigits.map((_, i) => (
              <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: i < filledCount ? BRAND_RED : 'rgba(255,255,255,0.15)', transition: 'background 0.1s' }} />
            ))}
          </div>

          {/* Keypad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => (
              <div key={key} style={{ height: 60, background: 'rgba(255,255,255,0.06)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white', fontWeight: 600 }}>
                {key}
              </div>
            ))}
          </div>
        </div>

        {/* Success banner */}
        <div style={{ opacity: successOpacity, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 16, padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 28 }}>✅</span>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#4ade80', margin: 0 }}>Clocked in — 7:58 AM</p>
            <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '4px 0 0' }}>Little Stars · Maria Santos</p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Meal count ────────────────────────────────────────────────────────

const MealCountScene: React.FC = () => {
  const frame = useCurrentFrame();

  const classroomOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const countOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' });
  const submitOpacity = interpolate(frame, [55, 70], [0, 1], { extrapolateRight: 'clamp' });
  const doneOpacity = interpolate(frame, [80, 95], [0, 1], { extrapolateRight: 'clamp' });

  const count = Math.round(interpolate(frame, [25, 50], [0, 12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 520, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ ...useFadeUp(frame, 0), textAlign: 'center' }}>
          <p style={{ fontSize: 36, fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Meal Count</p>
          <p style={{ fontSize: 18, color: TEXT_SECONDARY, margin: 0 }}>Breakfast · Monday, March 16</p>
        </div>

        {/* Step 1: classroom */}
        <div style={{ opacity: classroomOpacity, background: CARD_BG, border: CARD_BORDER, borderRadius: 16, padding: 24 }}>
          <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Classroom</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {['Little Stars', 'Toddlers', 'Preschool'].map((cls, i) => (
              <div key={cls} style={{ flex: 1, padding: '12px 8px', borderRadius: 10, background: i === 0 ? BRAND_RED : 'rgba(255,255,255,0.04)', border: i === 0 ? 'none' : CARD_BORDER, textAlign: 'center', fontSize: 14, fontWeight: 600, color: i === 0 ? 'white' : TEXT_SECONDARY }}>
                {cls}
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: count */}
        <div style={{ opacity: countOpacity, background: CARD_BG, border: CARD_BORDER, borderRadius: 16, padding: 28, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Children Served</p>
          <p style={{ fontSize: 80, fontWeight: 800, color: 'white', margin: 0, lineHeight: 1 }}>{count}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: CARD_BORDER, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>−</div>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: BRAND_RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white' }}>+</div>
          </div>
        </div>

        {/* Step 3: submit */}
        <div style={{ opacity: submitOpacity, background: BRAND_RED, borderRadius: 16, padding: '18px 0', textAlign: 'center', fontSize: 20, fontWeight: 700, color: 'white' }}>
          Submit Count
        </div>

        {/* Done confirmation */}
        <div style={{ opacity: doneOpacity, textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: '#4ade80', margin: 0 }}>Submitted in 12 seconds</p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Photo upload ──────────────────────────────────────────────────────

const PhotoUploadScene: React.FC = () => {
  const frame = useCurrentFrame();

  const photos = [
    { label: 'Story time', color: '#7c3aed' },
    { label: 'Art project', color: '#0891b2' },
    { label: 'Outdoor play', color: '#16a34a' },
  ];

  const uploadProgress = interpolate(frame, [40, 85], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Upload Classroom Photos</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Parents receive them instantly</p>
      </div>

      <div style={{ display: 'flex', gap: 32 }}>
        {photos.map((p, i) => {
          const photoOpacity = interpolate(frame, [15 + i * 12, 35 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={p.label} style={{ opacity: photoOpacity, width: 220, height: 180, borderRadius: 20, background: p.color, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16, boxShadow: `0 8px 32px rgba(0,0,0,0.4)` }}>
              <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '6px 12px' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'white', margin: 0 }}>{p.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ ...useFadeUp(frame, 35), width: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ fontSize: 15, color: TEXT_SECONDARY, margin: 0 }}>Uploading to parent feed...</p>
          <p style={{ fontSize: 15, color: 'white', margin: 0 }}>{Math.round(uploadProgress)}%</p>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${uploadProgress}%`, height: '100%', background: BRAND_RED, borderRadius: 4 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Nap time tasks ────────────────────────────────────────────────────

const NapTasksScene: React.FC = () => {
  const frame = useCurrentFrame();

  const tasks = [
    { label: 'Cots laid out', done: true },
    { label: 'Attendance confirmed', done: true },
    { label: 'Diapering log updated', done: true },
    { label: 'Sleep positions recorded', done: false },
    { label: 'Wake-up check at 2:30 PM', done: false },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Nap Time Checklist</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Stay on top of licensing requirements</p>
      </div>

      <div style={{ width: 540, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tasks.map((task, i) => {
          const itemOpacity = interpolate(frame, [15 + i * 10, 30 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const itemX = interpolate(frame, [15 + i * 10, 30 + i * 10], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={task.label} style={{ opacity: itemOpacity, transform: `translateX(${itemX}px)`, display: 'flex', alignItems: 'center', gap: 20, background: CARD_BG, border: CARD_BORDER, borderRadius: 14, padding: '16px 24px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: task.done ? '#16a34a' : 'rgba(255,255,255,0.1)', border: task.done ? 'none' : '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white', flexShrink: 0 }}>
                {task.done ? '✓' : ''}
              </div>
              <p style={{ fontSize: 18, color: task.done ? TEXT_SECONDARY : 'white', margin: 0, textDecoration: task.done ? 'line-through' : 'none' }}>{task.label}</p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene: Schedule view ─────────────────────────────────────────────────────

const ScheduleViewScene: React.FC = () => {
  const frame = useCurrentFrame();

  const shifts = [
    { day: 'Mon', time: '7:00 – 3:00', role: 'Infants' },
    { day: 'Tue', time: '7:00 – 3:00', role: 'Infants' },
    { day: 'Wed', time: 'OFF', role: '' },
    { day: 'Thu', time: '9:00 – 5:00', role: 'Preschool' },
    { day: 'Fri', time: '7:00 – 3:00', role: 'Infants' },
  ];

  return (
    <AbsoluteFill style={{ background: BG_DARK, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={useFadeUp(frame, 0)}>
        <p style={{ fontSize: 42, fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 8px' }}>Your Week at a Glance</p>
        <p style={{ fontSize: 20, color: TEXT_SECONDARY, textAlign: 'center', margin: 0 }}>Request changes directly from the app</p>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {shifts.map((shift, i) => {
          const cardOpacity = interpolate(frame, [15 + i * 12, 32 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const cardY = interpolate(frame, [15 + i * 12, 32 + i * 12], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const isOff = shift.time === 'OFF';
          return (
            <div key={shift.day} style={{ opacity: cardOpacity, transform: `translateY(${cardY}px)`, width: 160, background: isOff ? 'rgba(255,255,255,0.02)' : CARD_BG, border: isOff ? '1px solid rgba(255,255,255,0.05)' : `1px solid ${BRAND_RED}40`, borderRadius: 20, padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{shift.day}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: isOff ? TEXT_SECONDARY : 'white', margin: '0 0 8px' }}>{shift.time}</p>
              {shift.role && <p style={{ fontSize: 13, color: BRAND_RED, margin: 0 }}>{shift.role}</p>}
            </div>
          );
        })}
      </div>

      <div style={{ ...useFadeUp(frame, 75), background: BRAND_RED, borderRadius: 14, padding: '14px 36px', fontSize: 17, fontWeight: 700, color: 'white' }}>
        Request Schedule Change
      </div>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const EmployeeWorkflowVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      {/* Title — 0s–7s */}
      <Sequence from={0} durationInFrames={sec(7)}>
        <TitleCard title="Your Daily Workflow" subtitle="Everything you need, right from your phone" />
      </Sequence>

      {/* Clock in — 7s–16s */}
      <Sequence from={sec(7)} durationInFrames={sec(9)}>
        <ClockInScene />
        <NarrationText text="Start your shift with a quick PIN. You're clocked in in under five seconds." />
      </Sequence>

      {/* Meal count — 16s–25s */}
      <Sequence from={sec(16)} durationInFrames={sec(9)}>
        <MealCountScene />
        <NarrationText text="Pick your classroom, tap the count, and submit. Meal count done in 15 seconds." />
      </Sequence>

      {/* Photos — 25s–34s */}
      <Sequence from={sec(25)} durationInFrames={sec(9)}>
        <PhotoUploadScene />
        <NarrationText text="Take a few photos, upload them here. Families see them in their feed immediately." />
      </Sequence>

      {/* Nap tasks — 34s–43s */}
      <Sequence from={sec(34)} durationInFrames={sec(9)}>
        <NapTasksScene />
        <NarrationText text="The nap time checklist keeps you on top of every licensing requirement." />
      </Sequence>

      {/* Schedule — 43s–52s */}
      <Sequence from={sec(43)} durationInFrames={sec(9)}>
        <ScheduleViewScene />
        <NarrationText text="Check your week and request shift changes — no group texts, no confusion." />
      </Sequence>

      {/* Outro — 52s–60s */}
      <Sequence from={sec(52)} durationInFrames={sec(8)}>
        <TitleCard
          title="That's your whole shift."
          subtitle="Clock in. Count meals. Upload photos. Done."
        />
      </Sequence>
    </AbsoluteFill>
  );
};
