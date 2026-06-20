'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type {
  KioskClient,
  KioskFamily,
  FamilyParent,
  FamilyChildRow,
  AttendanceRow,
} from '@/lib/kiosk-data';
import { PrivacyNotice, SeeStaffScreen } from './PrivacyNotice';

// ============================================================
// Helpers
// ============================================================

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getChildAge(dateOfBirth: string | null): string {
  if (!dateOfBirth) return '';
  const today = new Date();
  const dob = new Date(dateOfBirth);
  const months =
    (today.getFullYear() - dob.getFullYear()) * 12 +
    (today.getMonth() - dob.getMonth());
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years}yr`;
  return `${years}yr ${rem}mo`;
}

function getPrimaryParentLastName(parents: FamilyParent[]): string {
  const primary = parents.find((p) => p.is_primary) || parents[0];
  if (!primary) return 'Family';
  const parts = primary.name.trim().split(' ');
  return parts.length > 1 ? parts[parts.length - 1] : parts[0];
}

function ZLogo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="flex-shrink-0">
      <defs>
        <linearGradient id="kioskZGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFC107" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="#ffffff" fillOpacity="0.2" />
      <path
        d="M12,10 L28,10 Q30,10 29,12 L17,26 L28,26 Q30,26 30,28 Q30,30 28,30 L12,30 Q10,30 11,28 L23,14 L12,14 Q10,14 10,12 Q10,10 12,10 Z"
        fill="url(#kioskZGrad)"
      />
      <circle cx="31" cy="9" r="1.5" fill="#FFE082" opacity="0.9" />
    </svg>
  );
}

// ============================================================
// PIN Pad Screen
// ============================================================

function PinScreen({
  client,
  isDemo,
  onSuccess,
}: {
  client: KioskClient;
  isDemo: boolean;
  onSuccess: (family: KioskFamily) => void;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const MAX_PIN = 4;

  const handleDigit = useCallback(
    (digit: string) => {
      if (loading || pin.length >= MAX_PIN) return;
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

    const family = await client.lookupFamilyByPin(pin);
    if (family) {
      onSuccess(family);
    } else {
      setShaking(true);
      setError('Invalid PIN. Try again.');
      setPin('');
      setTimeout(() => setShaking(false), 600);
    }
    setLoading(false);
  }, [pin, loading, onSuccess, client]);

  useEffect(() => {
    if (pin.length === MAX_PIN) handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', null, '0', 'back'];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-christina-red text-white px-6 py-5 flex items-center gap-4">
        <ZLogo size={56} />
        <div className="flex-1">
          <div className="text-2xl font-bold leading-tight">Christina&apos;s</div>
          <div className="text-base opacity-90 leading-tight">Child Care Center</div>
        </div>
        {isDemo && (
          <span className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1">
            DEMO
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">Enter your family PIN</p>
          <p className="text-gray-500 mt-2 text-lg">
            {isDemo
              ? 'Demo PINs: 1234, 5678, 9876'
              : '4-digit number from your welcome letter'}
          </p>
        </div>

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

        {error && (
          <p className="text-red-600 font-semibold text-xl -mt-4">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {buttons.map((btn, idx) => {
            if (btn === null) return <div key={idx} />;
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

      <div className="text-right px-6 pb-4">
        <Link
          href="/admin-login"
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Admin
        </Link>
      </div>
    </div>
  );
}

// ============================================================
// Child Card
// ============================================================

function ChildCard({
  client,
  child,
  familyId,
  onAction,
}: {
  client: KioskClient;
  child: FamilyChildRow;
  familyId: string;
  onAction: () => void;
}) {
  const [attendance, setAttendance] = useState<AttendanceRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    client.getTodayAttendance(child.id).then((rec) => {
      setAttendance(rec);
      setLoaded(true);
    });
  }, [child.id, client]);

  const isCheckedIn =
    attendance !== null &&
    attendance.check_in !== null &&
    attendance.check_out === null;

  async function handleToggle() {
    setBusy(true);
    if (isCheckedIn) {
      await client.checkOut(child.id);
    } else {
      await client.checkIn(child, familyId);
    }
    const updated = await client.getTodayAttendance(child.id);
    setAttendance(updated);
    setBusy(false);
    onAction();
  }

  if (!loaded)
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5 animate-pulse h-24" />
    );

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-christina-red flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
        {child.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-gray-800 truncate">{child.name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {child.date_of_birth && (
            <span className="text-sm text-gray-500">
              {getChildAge(child.date_of_birth)}
            </span>
          )}
          {child.classroom && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500 capitalize">
                {child.classroom}
              </span>
            </>
          )}
        </div>
        {isCheckedIn && attendance?.check_in ? (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Checked in at {formatTime(attendance.check_in)}
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 rounded-full px-3 py-1 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
            Not checked in
          </div>
        )}
      </div>
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

// ============================================================
// Welcome Screen
// ============================================================

const AUTO_RESET_SECONDS = 15;

function WelcomeScreen({
  client,
  family,
  onDone,
}: {
  client: KioskClient;
  family: KioskFamily;
  onDone: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RESET_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(AUTO_RESET_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
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

  const lastName = getPrimaryParentLastName(family.parents);

  return (
    <div
      className="flex flex-col min-h-screen"
      onPointerDown={resetTimer}
      onKeyDown={resetTimer}
    >
      <div className="bg-christina-red text-white px-6 py-5 flex items-center gap-4">
        <ZLogo size={56} />
        <div className="flex-1">
          <div className="text-2xl font-bold leading-tight">
            Welcome, {lastName} family!
          </div>
          <div className="text-base opacity-90 leading-tight">
            Christina&apos;s Child Care Center
          </div>
        </div>
        <div className="text-right text-sm opacity-70 leading-tight">
          <div>Auto-reset</div>
          <div className="text-2xl font-bold opacity-90">{secondsLeft}s</div>
        </div>
      </div>

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
              client={client}
              child={child}
              familyId={family.id}
              onAction={resetTimer}
            />
          ))
        )}
      </div>

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

// ============================================================
// Root
// ============================================================

export default function KioskScreen({
  client,
  isDemo = false,
}: {
  client: KioskClient;
  isDemo?: boolean;
}) {
  const [activeFamily, setActiveFamily] = useState<KioskFamily | null>(null);
  const [pendingFamily, setPendingFamily] = useState<KioskFamily | null>(null);
  const [declined, setDeclined] = useState(false);

  // MN DCYF gate: a family must have a CURRENT privacy-notice agreement before
  // they can check in. If not, show the notice first; they cannot reach the
  // check-in screen until they agree.
  async function handlePinSuccess(family: KioskFamily) {
    const current = await client.getPrivacyAttestationStatus(family.id);
    if (current) {
      setActiveFamily(family);
    } else {
      setPendingFamily(family);
    }
  }

  if (declined) {
    return <SeeStaffScreen onDone={() => setDeclined(false)} />;
  }

  if (pendingFamily) {
    return (
      <PrivacyNotice
        familyName={getPrimaryParentLastName(pendingFamily.parents)}
        onAgree={async () => {
          await client.recordPrivacyAttestation(
            pendingFamily.id,
            getPrimaryParentLastName(pendingFamily.parents)
          );
          const f = pendingFamily;
          setPendingFamily(null);
          setActiveFamily(f);
        }}
        onDecline={() => {
          setPendingFamily(null);
          setDeclined(true);
        }}
      />
    );
  }

  return activeFamily ? (
    <WelcomeScreen
      client={client}
      family={activeFamily}
      onDone={() => setActiveFamily(null)}
    />
  ) : (
    <PinScreen client={client} isDemo={isDemo} onSuccess={handlePinSuccess} />
  );
}
