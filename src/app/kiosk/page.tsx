'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { getFamilyByPin } from '@/lib/family-storage';
import { FamilyAccount, FamilyChild } from '@/types/family';

// ============================================================================
// Attendance Storage
// ============================================================================

const ATTENDANCE_KEY = 'christinas_attendance';

interface AttendanceRecord {
  id: string;
  child_id: string;
  child_name: string;
  family_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  checked_in_by: 'kiosk';
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getAttendance(): AttendanceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAttendance(records: AttendanceRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

function getTodayRecordForChild(childId: string): AttendanceRecord | null {
  const today = getTodayDate();
  const records = getAttendance();
  return records.find((r) => r.child_id === childId && r.date === today) || null;
}

function checkInChild(child: FamilyChild, familyId: string): void {
  const today = getTodayDate();
  const records = getAttendance();
  const existing = records.find((r) => r.child_id === child.id && r.date === today);
  if (existing) return; // Already checked in

  const newRecord: AttendanceRecord = {
    id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    child_id: child.id,
    child_name: child.name,
    family_id: familyId,
    date: today,
    check_in: new Date().toISOString(),
    check_out: null,
    checked_in_by: 'kiosk',
  };

  records.push(newRecord);
  saveAttendance(records);
}

function checkOutChild(childId: string): void {
  const today = getTodayDate();
  const records = getAttendance();
  const index = records.findIndex((r) => r.child_id === childId && r.date === today);
  if (index === -1) return;

  records[index] = {
    ...records[index],
    check_out: new Date().toISOString(),
  };

  saveAttendance(records);
}

// ============================================================================
// Helpers
// ============================================================================

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getChildAge(dateOfBirth: string): string {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  const months =
    (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years}yr`;
  return `${years}yr ${rem}mo`;
}

function getPrimaryParentName(family: FamilyAccount): string {
  const primary = family.parents.find((p) => p.is_primary) || family.parents[0];
  if (!primary) return 'Family';
  // Return last name from primary parent for "Welcome, [Last Name] family!"
  const parts = primary.name.trim().split(' ');
  return parts.length > 1 ? parts[parts.length - 1] : parts[0];
}

// ============================================================================
// Z Logo SVG (extracted from Header.tsx)
// ============================================================================

function ZLogo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="flex-shrink-0">
      <defs>
        <linearGradient id="kioskZGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFC107" />
        </linearGradient>
        <filter id="kioskZGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="20" fill="#ffffff" fillOpacity="0.2" />
      <g filter="url(#kioskZGlow)">
        <path
          d="M12,10 L28,10 Q30,10 29,12 L17,26 L28,26 Q30,26 30,28 Q30,30 28,30 L12,30 Q10,30 11,28 L23,14 L12,14 Q10,14 10,12 Q10,10 12,10 Z"
          fill="url(#kioskZGradient)"
        />
      </g>
      <circle cx="31" cy="9" r="1.5" fill="#FFE082" opacity="0.9" />
      <circle cx="33" cy="12" r="1" fill="#FFE082" opacity="0.7" />
    </svg>
  );
}

// ============================================================================
// PIN Pad Screen
// ============================================================================

interface PinScreenProps {
  onSuccess: (family: FamilyAccount) => void;
}

function PinScreen({ onSuccess }: PinScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const MAX_PIN = 4;

  const handleDigit = useCallback(
    (digit: string) => {
      if (loading) return;
      if (pin.length >= MAX_PIN) return;
      setError('');
      setPin((prev) => prev + digit);
    },
    [pin, loading]
  );

  const handleBackspace = useCallback(() => {
    if (loading) return;
    setError('');
    setPin((prev) => prev.slice(0, -1));
  }, [loading]);

  const handleSubmit = useCallback(async () => {
    if (pin.length !== MAX_PIN || loading) return;
    setLoading(true);

    // Small delay for perceived responsiveness
    await new Promise((r) => setTimeout(r, 300));

    const family = await getFamilyByPin(pin);
    if (family) {
      onSuccess(family);
    } else {
      setShaking(true);
      setError('Invalid PIN. Try again.');
      setPin('');
      setTimeout(() => setShaking(false), 600);
    }
    setLoading(false);
  }, [pin, loading, onSuccess]);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === MAX_PIN) {
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    null, '0', 'back',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-christina-red text-white px-6 py-5 flex items-center gap-4">
        <ZLogo size={56} />
        <div>
          <div className="text-2xl font-bold leading-tight">Christina&apos;s</div>
          <div className="text-base opacity-90 leading-tight">Child Care Center</div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">Enter your family PIN</p>
          <p className="text-gray-500 mt-2 text-lg">4-digit number from your welcome letter</p>
        </div>

        {/* PIN dots */}
        <div className={`flex gap-5 ${shaking ? 'animate-shake' : ''}`}>
          {Array.from({ length: MAX_PIN }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-150 ${
                i < pin.length
                  ? 'bg-christina-red border-christina-red scale-110'
                  : 'bg-white border-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 font-semibold text-xl -mt-4">{error}</p>
        )}

        {/* PIN pad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {buttons.map((btn, idx) => {
            if (btn === null) {
              return <div key={idx} />;
            }
            if (btn === 'back') {
              return (
                <button
                  key="back"
                  onClick={handleBackspace}
                  disabled={loading || pin.length === 0}
                  className="h-[72px] rounded-2xl bg-white border-2 border-gray-200 text-gray-600 text-2xl font-semibold shadow-sm active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center"
                  aria-label="Backspace"
                >
                  &#8592;
                </button>
              );
            }
            return (
              <button
                key={btn}
                onClick={() => handleDigit(btn)}
                disabled={loading || pin.length >= MAX_PIN}
                className="h-[72px] rounded-2xl bg-white border-2 border-gray-200 text-gray-800 text-3xl font-bold shadow-sm hover:bg-gray-50 active:scale-95 active:bg-gray-100 transition-all disabled:opacity-40"
              >
                {btn}
              </button>
            );
          })}
        </div>

        {loading && (
          <p className="text-gray-400 text-lg animate-pulse">Checking PIN...</p>
        )}
      </div>

      {/* Admin link */}
      <div className="text-right px-6 pb-4">
        <Link href="/admin-login" className="text-xs text-gray-400 hover:text-gray-600">
          Admin
        </Link>
      </div>

    </div>
  );
}

// ============================================================================
// Child Card
// ============================================================================

interface ChildCardProps {
  child: FamilyChild;
  familyId: string;
  onAction: () => void;
}

function ChildCard({ child, familyId, onAction }: ChildCardProps) {
  const [record, setRecord] = useState<ReturnType<typeof getTodayRecordForChild>>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setRecord(getTodayRecordForChild(child.id));
  }, [child.id]);

  const isCheckedIn = record !== null && record.check_in !== null && record.check_out === null;

  async function handleToggle() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 200));

    if (isCheckedIn) {
      checkOutChild(child.id);
    } else {
      checkInChild(child, familyId);
    }

    setRecord(getTodayRecordForChild(child.id));
    setBusy(false);
    onAction();
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5 flex items-center gap-4">
      {/* Avatar initial */}
      <div className="w-14 h-14 rounded-full bg-christina-red flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
        {child.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-gray-800 truncate">{child.name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-sm text-gray-500">{getChildAge(child.date_of_birth)}</span>
          {child.classroom && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">{child.classroom}</span>
            </>
          )}
        </div>
        {/* Status badge */}
        {isCheckedIn && record?.check_in ? (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Checked in at {formatTime(record.check_in)}
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 rounded-full px-3 py-1 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
            Not checked in
          </div>
        )}
      </div>

      {/* Action button */}
      <button
        onClick={handleToggle}
        disabled={busy}
        className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold text-white text-lg min-w-[120px] text-center active:scale-95 transition-all disabled:opacity-50 ${
          isCheckedIn
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {busy ? '...' : isCheckedIn ? 'Check Out' : 'Check In'}
      </button>
    </div>
  );
}

// ============================================================================
// Welcome Screen
// ============================================================================

const AUTO_RESET_SECONDS = 15;

interface WelcomeScreenProps {
  family: FamilyAccount;
  onDone: () => void;
}

function WelcomeScreen({ family, onDone }: WelcomeScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RESET_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(AUTO_RESET_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onDone]);

  function resetTimer() {
    startTimer();
  }

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const lastName = getPrimaryParentName(family);

  return (
    <div
      className="flex flex-col min-h-screen"
      onPointerDown={resetTimer}
      onKeyDown={resetTimer}
    >
      {/* Header */}
      <div className="bg-christina-red text-white px-6 py-5 flex items-center gap-4">
        <ZLogo size={56} />
        <div className="flex-1">
          <div className="text-2xl font-bold leading-tight">
            Welcome, {lastName} family! &#x1F44B;
          </div>
          <div className="text-base opacity-90 leading-tight">
            Christina&apos;s Child Care Center
          </div>
        </div>
        {/* Auto-reset countdown */}
        <div className="text-right text-sm opacity-70 leading-tight">
          <div>Auto-reset</div>
          <div className="text-2xl font-bold opacity-90">{secondsLeft}s</div>
        </div>
      </div>

      {/* Children list */}
      <div className="flex-1 px-5 py-6 flex flex-col gap-4 overflow-auto">
        <p className="text-gray-500 text-base px-1">
          Tap Check In or Check Out for each child below.
        </p>

        {family.children.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-lg">
            No children on this account yet.
          </div>
        ) : (
          family.children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              familyId={family.id}
              onAction={resetTimer}
            />
          ))
        )}
      </div>

      {/* Done button */}
      <div className="px-5 pb-6">
        <button
          onClick={onDone}
          className="w-full py-4 rounded-2xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xl active:scale-[0.98] transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Root Page
// ============================================================================

export default function KioskPage() {
  const [activeFamily, setActiveFamily] = useState<FamilyAccount | null>(null);

  function handlePinSuccess(family: FamilyAccount) {
    setActiveFamily(family);
  }

  function handleDone() {
    setActiveFamily(null);
  }

  if (activeFamily) {
    return <WelcomeScreen family={activeFamily} onDone={handleDone} />;
  }

  return <PinScreen onSuccess={handlePinSuccess} />;
}
