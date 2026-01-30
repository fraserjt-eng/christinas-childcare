import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface MockUIProps {
  screen: 'lesson-builder' | 'curriculum' | 'staff' | 'attendance' | 'reports' | 'dashboard';
  highlightArea?: { x: number; y: number; width: number; height: number };
  showCursor?: boolean;
  cursorPosition?: { x: number; y: number };
}

// Actual nav items from your admin layout
const adminNav = [
  { label: 'Overview', icon: '🏠', href: 'admin' },
  { label: 'Attendance', icon: '📋', href: 'attendance' },
  { label: 'Food Counts', icon: '🍽️', href: 'food-counts' },
  { label: 'Staff Scheduling', icon: '⏰', href: 'scheduling' },
  { label: 'Ratio Monitor', icon: '📊', href: 'ratios' },
  { label: 'Curriculum', icon: '🎓', href: 'curriculum' },
  { label: 'Strategic Plan', icon: '🎯', href: 'strategic' },
  { label: 'Lesson Builder', icon: '📖', href: 'lesson-builder' },
  { label: 'Staff Directory', icon: '👤', href: 'staff' },
  { label: 'Daily Reports', icon: '📑', href: 'reports' },
];

const screenToHref: Record<string, string> = {
  'lesson-builder': 'lesson-builder',
  'curriculum': 'curriculum',
  'staff': 'staff',
  'attendance': 'attendance',
  'reports': 'reports',
  'dashboard': 'admin',
};

export const MockUI: React.FC<MockUIProps> = ({
  screen,
  highlightArea,
  showCursor = false,
  cursorPosition = { x: 960, y: 540 }
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });

  const activeHref = screenToHref[screen] || 'admin';

  return (
    <AbsoluteFill
      style={{
        background: '#f4f4f5', // bg-muted/30
        opacity: fadeIn,
        transform: `scale(${interpolate(scale, [0, 1], [0.98, 1])})`,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Sidebar - matches your DashboardLayout */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 256,
          background: 'white',
          borderRight: '1px solid #e5e5e5',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo header */}
        <div style={{ padding: 16, borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="32" height="32" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="20" fill="#C62828" />
            <path d="M12 14 C12 14 20 8 28 14" stroke="#FFD54F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <line x1="20" y1="10" x2="20" y2="28" stroke="#FFD54F" strokeWidth="2" strokeLinecap="round" />
            <text x="20" y="34" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">C</text>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>Christina&apos;s</span>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingLeft: 12 }}>
            Business Hub
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {adminNav.map((item) => {
              const isActive = item.href === activeHref;
              return (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: isActive ? 'rgba(198, 40, 40, 0.1)' : 'transparent',
                    color: isActive ? '#C62828' : '#71717a',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User footer */}
        <div style={{ padding: 16, borderTop: '1px solid #e5e5e5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#C62828', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 600 }}>
              OZ
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>Ophelia Zeogar</p>
              <p style={{ fontSize: 12, color: '#71717a' }}>Owner / Director</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header bar */}
      <div
        style={{
          position: 'absolute',
          left: 256,
          top: 0,
          right: 0,
          height: 56,
          background: 'white',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 24px',
        }}
      >
        <div style={{ padding: '4px 12px', border: '1px solid #e5e5e5', borderRadius: 6, fontSize: 13, color: '#71717a', display: 'flex', alignItems: 'center', gap: 6 }}>
          🏢 5510 W Broadway Ave, Crystal
        </div>
      </div>

      {/* Main content area */}
      <div
        style={{
          position: 'absolute',
          left: 256,
          top: 56,
          right: 0,
          bottom: 0,
          padding: 32,
          overflow: 'hidden',
        }}
      >
        {renderScreenContent(screen)}
      </div>

      {/* Highlight overlay */}
      {highlightArea && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: highlightArea.x,
              top: highlightArea.y,
              width: highlightArea.width,
              height: highlightArea.height,
              border: '3px solid #C62828',
              borderRadius: 8,
              background: 'transparent',
              boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* Cursor */}
      {showCursor && (
        <div
          style={{
            position: 'absolute',
            left: cursorPosition.x,
            top: cursorPosition.y,
            width: 24,
            height: 24,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.38 2.88a.5.5 0 0 0-.88.33Z"
              fill="#fff"
              stroke="#000"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};

function renderScreenContent(screen: string) {
  switch (screen) {
    case 'lesson-builder':
      return <LessonBuilderScreen />;
    case 'curriculum':
      return <CurriculumScreen />;
    case 'staff':
      return <StaffScreen />;
    case 'attendance':
      return <AttendanceScreen />;
    case 'reports':
      return <ReportsScreen />;
    default:
      return <DashboardScreen />;
  }
}

// Card component matching your shadcn/ui style
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e5e5', ...style }}>
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'secondary' | 'outline'; style?: React.CSSProperties }> = ({ children, variant = 'default', style }) => {
  const baseStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  };
  const variants: Record<string, React.CSSProperties> = {
    default: { background: 'rgba(198, 40, 40, 0.1)', color: '#C62828' },
    secondary: { background: '#f4f4f5', color: '#71717a' },
    outline: { background: 'transparent', border: '1px solid #e5e5e5', color: '#71717a' },
  };
  return <span style={{ ...baseStyle, ...variants[variant], ...style }}>{children}</span>;
};

const TabsList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', gap: 4, background: '#f4f4f5', padding: 4, borderRadius: 8, marginBottom: 16 }}>
    {children}
  </div>
);

const TabsTrigger: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <div style={{
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    background: active ? 'white' : 'transparent',
    color: active ? '#1a1a1a' : '#71717a',
    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }}>
    {children}
  </div>
);

const LessonBuilderScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Lesson Builder</h1>
        <p style={{ fontSize: 14, color: '#71717a', margin: '4px 0 0' }}>Create, manage, and remix lesson plans for all age groups.</p>
      </div>
      <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        🎯 Start Tour
      </button>
    </div>

    <TabsList>
      <TabsTrigger active>➕ New Lesson</TabsTrigger>
      <TabsTrigger>📖 Library <Badge variant="secondary">12</Badge></TabsTrigger>
      <TabsTrigger>🔀 Remix</TabsTrigger>
      <TabsTrigger>📊 Analytics</TabsTrigger>
    </TabsList>

    <div style={{ display: 'flex', gap: 24 }}>
      {/* Form Card */}
      <Card style={{ flex: 1, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: '0 0 20px' }}>Create New Lesson</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 6, display: 'block' }}>Age Group</label>
            <div style={{ height: 40, background: 'white', borderRadius: 6, border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', padding: '0 12px', color: '#71717a', fontSize: 14 }}>Select age group...</div>
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 6, display: 'block' }}>Topic</label>
            <div style={{ height: 40, background: 'white', borderRadius: 6, border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', padding: '0 12px', color: '#71717a', fontSize: 14 }}>Enter topic (e.g., Butterflies, Colors)...</div>
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 6, display: 'block' }}>Learning Domain</label>
            <div style={{ height: 40, background: 'white', borderRadius: 6, border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', padding: '0 12px', color: '#71717a', fontSize: 14 }}>Select domain...</div>
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 6, display: 'block' }}>Duration</label>
            <div style={{ height: 40, background: 'white', borderRadius: 6, border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', padding: '0 12px', color: '#71717a', fontSize: 14 }}>30 minutes</div>
          </div>
          <button style={{ height: 44, background: '#C62828', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            ✨ Generate Lesson with AI
          </button>
        </div>
      </Card>

      {/* Preview Card */}
      <Card style={{ flex: 1, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: '0 0 16px' }}>Lesson Preview</h3>
        <div style={{ color: '#71717a', fontSize: 14, textAlign: 'center', padding: '60px 20px', border: '2px dashed #e5e5e5', borderRadius: 8 }}>
          Your generated lesson will appear here
        </div>
      </Card>
    </div>
  </div>
);

const CurriculumScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Curriculum</h1>
      <p style={{ fontSize: 14, color: '#71717a', margin: '4px 0 0' }}>Manage curriculum by classroom and track developmental milestones.</p>
    </div>

    <TabsList>
      <TabsTrigger active>👶 Infant</TabsTrigger>
      <TabsTrigger>🧒 Toddler</TabsTrigger>
      <TabsTrigger>📚 Preschool</TabsTrigger>
      <TabsTrigger>🎒 School Age</TabsTrigger>
    </TabsList>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {['Sensory Exploration', 'Tummy Time Activities', 'Music & Movement', 'Language Development', 'Fine Motor Skills', 'Social Interaction'].map((lesson) => (
        <Card key={lesson} style={{ padding: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px' }}>{lesson}</h4>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <Badge>Infant</Badge>
            <Badge variant="outline">15 min</Badge>
          </div>
          <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>Age-appropriate developmental activities</p>
        </Card>
      ))}
    </div>
  </div>
);

const StaffScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 32 }}>👥</span>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Staff Directory</h1>
        <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>Manage team members and schedules</p>
      </div>
    </div>

    <TabsList>
      <TabsTrigger active>Profiles</TabsTrigger>
      <TabsTrigger>Schedule Overview</TabsTrigger>
    </TabsList>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {[
        { name: 'Ophelia Zeogar', initials: 'OZ', role: 'Owner / Director', color: '#C62828' },
        { name: 'Christina Fraser', initials: 'CF', role: 'Assistant Director', color: '#C62828' },
        { name: 'Maria Santos', initials: 'MS', role: 'Lead Teacher - Infants', color: '#ec4899' },
        { name: 'James Robinson', initials: 'JR', role: 'Lead Teacher - Toddlers', color: '#3b82f6' },
      ].map((staff) => (
        <Card key={staff.name} style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: staff.color, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 600 }}>
            {staff.initials}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>{staff.name}</h3>
          <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 12px' }}>{staff.role}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            <Badge variant="secondary">CPR/First Aid</Badge>
            <Badge variant="secondary">CDA</Badge>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const AttendanceScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Attendance</h1>
        <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>Monday, January 27, 2026</p>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <Card style={{ padding: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#C62828', margin: 0 }}>18</p>
        <p style={{ fontSize: 12, color: '#71717a', margin: 0 }}>Present</p>
      </Card>
      <Card style={{ padding: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#f97316', margin: 0 }}>2</p>
        <p style={{ fontSize: 12, color: '#71717a', margin: 0 }}>Not Checked In</p>
      </Card>
      <Card style={{ padding: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6', margin: 0 }}>4</p>
        <p style={{ fontSize: 12, color: '#71717a', margin: 0 }}>Departed</p>
      </Card>
    </div>

    <Card style={{ padding: 0 }}>
      <div style={{ padding: 16, borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Daily Attendance</h3>
        <div style={{ padding: '6px 12px', background: 'white', border: '1px solid #e5e5e5', borderRadius: 6, fontSize: 14 }}>All Children ▾</div>
      </div>
      <div style={{ padding: 8 }}>
        {['Emma Thompson', 'Liam Garcia', 'Olivia Williams', 'Noah Brown'].map((name, i) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: i % 2 === 0 ? '#f9fafb' : 'white', borderRadius: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C62828' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{name}</p>
              <p style={{ fontSize: 12, color: '#71717a', margin: 0 }}>Little Stars</p>
            </div>
            <span style={{ fontSize: 12, color: '#71717a' }}>↓ 7:45 AM</span>
            <button style={{ padding: '4px 12px', background: 'white', border: '1px solid #e5e5e5', borderRadius: 6, fontSize: 12 }}>Check Out</button>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const ReportsScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Daily Reports</h1>
      <p style={{ fontSize: 14, color: '#71717a', margin: '4px 0 0' }}>Generate and export reports for compliance and parents.</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {[
        { title: 'Attendance Report', icon: '📋', desc: 'Daily check-in/out records' },
        { title: 'Staff Hours', icon: '⏱️', desc: 'Weekly hours by employee' },
        { title: 'Ratio Compliance', icon: '✅', desc: 'Staff-to-child ratios' },
        { title: 'Enrollment Stats', icon: '📊', desc: 'Current enrollment data' },
        { title: 'Financial Summary', icon: '💰', desc: 'Revenue and expenses' },
        { title: 'DCYF Export', icon: '📤', desc: 'Formatted for licensing' },
      ].map((report) => (
        <Card key={report.title} style={{ padding: 20, cursor: 'pointer' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{report.icon}</div>
          <h4 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>{report.title}</h4>
          <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>{report.desc}</p>
        </Card>
      ))}
    </div>
  </div>
);

const DashboardScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Overview</h1>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {[
        { label: 'Children Present', value: '24', color: '#C62828' },
        { label: 'Staff on Duty', value: '8', color: '#3b82f6' },
        { label: 'Messages', value: '3', color: '#f59e0b' },
        { label: 'Lessons This Week', value: '12', color: '#8b5cf6' },
      ].map((stat) => (
        <Card key={stat.label} style={{ padding: 20 }}>
          <p style={{ fontSize: 12, color: '#71717a', margin: '0 0 8px' }}>{stat.label}</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
        </Card>
      ))}
    </div>
  </div>
);
