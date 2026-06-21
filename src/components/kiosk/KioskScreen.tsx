'use client';

// LIVE kiosk — the new front-facing (Tadpoles) design on REAL data.
//
// The kiosk runs OPEN on the lobby iPad (no session), so it cannot use the
// preview store + LivePortalHydrator the signed-in /preview screens use. It
// renders the SAME new design directly from the real, center-scoped /api/kiosk
// client (lookup, attendance, check-in/out, privacy attestation). Photos are not
// available open (no session), so avatars fall back to initials.
//
// Flow: PIN pad (with the center-name watermark) -> MN DCYF privacy gate -> the
// family check-in grid. Auto-resets to the pad after inactivity.

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Backpack,
  Baby,
  Blocks,
  Check,
  Delete,
  KeyRound,
  Palette,
  type LucideIcon,
} from 'lucide-react';
import type {
  KioskClient,
  KioskFamily,
  FamilyParent,
  FamilyChildRow,
  AttendanceRow,
} from '@/lib/kiosk-data';
import { PrivacyNotice, SeeStaffScreen } from './PrivacyNotice';
import { BigButton, SuccessBanner, cx } from '@/components/preview/ui';
import { PhotoAvatar } from '@/components/preview/PhotoAvatar';

// ---- helpers ----
function formatTime(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function primaryLastName(parents: FamilyParent[]): string {
  const primary = parents.find((p) => p.is_primary) || parents[0];
  if (!primary?.name) return '';
  const parts = primary.name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : parts[0];
}

// A real child carries a free-text classroom, not a fixtures roomId. Map common
// age-group words to the room look; default to the infant look. Keeps the new
// design's color + icon language without depending on the demo fixtures.
function roomLook(classroom: string | null): { icon: LucideIcon; color: string; label: string } {
  const c = (classroom || '').toLowerCase();
  if (/infant|baby|nursery/.test(c)) return { icon: Baby, color: 'var(--pv-sky)', label: classroom || 'Infants' };
  if (/toddler/.test(c)) return { icon: Blocks, color: 'var(--pv-teal)', label: classroom || 'Toddlers' };
  if (/pre|pk|preschool/.test(c)) return { icon: Palette, color: 'var(--pv-plum)', label: classroom || 'Preschool' };
  if (/school|kinder|age/.test(c)) return { icon: Backpack, color: 'var(--pv-gold)', label: classroom || 'School age' };
  return { icon: Baby, color: 'var(--pv-coral)', label: classroom || '' };
}

// ============================================================
// PIN pad (with the center-name watermark behind the keypad)
// ============================================================
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

function PinScreen({
  client,
  centerName,
  onSuccess,
}: {
  client: KioskClient;
  centerName: string;
  onSuccess: (family: KioskFamily) => void;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (value: string) => {
      setLoading(true);
      const family = await client.lookupFamilyByPin(value);
      setLoading(false);
      if (family) {
        onSuccess(family);
      } else {
        setShake(true);
        setError('That PIN was not found at this center.');
        setTimeout(() => {
          setShake(false);
          setPin('');
          setError('');
        }, 700);
      }
    },
    [client, onSuccess]
  );

  function press(key: string) {
    if (loading) return;
    if (key === '⌫') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (!key) return;
    const next = (pin + key).slice(0, 4);
    setPin(next);
    if (next.length === 4) setTimeout(() => submit(next), 120);
  }

  return (
    <main className="pv-portal-bg relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-6">
      {/* Center-name watermark: faded + glowing, behind the keypad, centered. */}
      {centerName ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
          <span
            className="pv-tad-title text-center"
            style={{
              fontSize: 'clamp(3.5rem, 17vw, 13rem)',
              lineHeight: 1,
              color: 'var(--pv-coral)',
              opacity: 0.09,
              textShadow: '0 0 70px var(--pv-coral)',
              whiteSpace: 'nowrap',
            }}
          >
            {centerName}
          </span>
        </div>
      ) : null}

      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="pv-rise mb-6 text-center" style={{ animationDelay: '30ms' }}>
          <h1 className="pv-tad-title text-4xl sm:text-5xl">Christina&apos;s Child Care</h1>
          {centerName ? (
            <p className="mt-2 text-lg font-semibold" style={{ color: 'var(--pv-muted)' }}>
              {centerName}
            </p>
          ) : null}
        </div>

        <div className={cx('pv-tile p-7 text-center sm:p-8', shake && 'pv-shake')}>
          <span
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--pv-coral) 12%, white)' }}
            aria-hidden="true"
          >
            <KeyRound size={26} style={{ color: 'var(--pv-coral)' }} />
          </span>
          <h2 className="pv-tad-title mt-4 text-3xl">Enter your family PIN</h2>
          <div className="mt-6 flex justify-center gap-4" aria-label={`${pin.length} of 4 digits`}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-5 w-5 rounded-full border-2 transition-all"
                style={{
                  borderColor: 'var(--pv-coral)',
                  backgroundColor: i < pin.length ? 'var(--pv-coral)' : 'transparent',
                }}
              />
            ))}
          </div>
          {error ? (
            <p className="mt-4 text-base font-bold" style={{ color: 'var(--pv-coral)' }}>
              {error}
            </p>
          ) : null}
          <div className="mx-auto mt-7 grid w-fit grid-cols-3 gap-4">
            {KEYS.map((key, i) =>
              key ? (
                <button
                  key={`${key}-${i}`}
                  type="button"
                  onClick={() => press(key)}
                  disabled={loading}
                  className="pv-press flex h-[76px] w-[76px] items-center justify-center rounded-2xl border text-3xl font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#fbfaf8', borderColor: 'var(--pv-line)', color: 'var(--pv-ink)' }}
                  aria-label={key === '⌫' ? 'Delete a digit' : key}
                >
                  {key === '⌫' ? <Delete size={28} aria-hidden="true" /> : key}
                </button>
              ) : (
                <span key={`blank-${i}`} className="h-[76px] w-[76px]" />
              )
            )}
          </div>
          {loading ? (
            <p className="mt-4 text-base" style={{ color: 'var(--pv-muted)' }}>
              Checking...
            </p>
          ) : null}
        </div>
      </div>

      <div className="absolute bottom-3 right-4 z-10">
        <Link href="/admin-login" className="text-xs" style={{ color: 'var(--pv-muted)' }}>
          Admin
        </Link>
      </div>
    </main>
  );
}

// ============================================================
// Child tile (real check-in / out)
// ============================================================
function ChildTile({
  client,
  child,
  familyId,
  onToggled,
}: {
  client: KioskClient;
  child: FamilyChildRow;
  familyId: string;
  onToggled: (msg: string) => void;
}) {
  const [att, setAtt] = useState<AttendanceRow | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    client.getTodayAttendance(child.id).then((r) => {
      setAtt(r);
      setLoaded(true);
    });
  }, [client, child.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const inAt = att?.check_in && !att?.check_out ? att.check_in : null;
  const look = roomLook(child.classroom);
  const RoomIcon = look.icon;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    if (inAt) {
      await client.checkOut(child.id);
    } else {
      await client.checkIn(child, familyId);
    }
    const updated = await client.getTodayAttendance(child.id);
    setAtt(updated);
    setBusy(false);
    const first = child.name.split(/\s+/)[0];
    onToggled(inAt ? `${first} is checked out. See you tomorrow!` : `${first} is checked in. Have a great day!`);
  }

  if (!loaded) return <div className="pv-tile h-44 animate-pulse" />;

  const first = child.name.split(/\s+/)[0];
  return (
    <div
      className="pv-lift rounded-lg border p-4 text-center"
      style={{ borderColor: inAt ? 'var(--pv-teal)' : 'var(--pv-line)', backgroundColor: inAt ? '#e7f4f2' : 'var(--pv-card)' }}
    >
      <button type="button" onClick={toggle} disabled={busy} className="pv-press pv-kiosk-target w-full disabled:opacity-60">
        <span className="block">
          <PhotoAvatar
            id={child.id}
            name={child.name}
            size={80}
            rounded="rounded-lg"
            className={cx('mx-auto', inAt ? '' : 'opacity-75 grayscale')}
          />
        </span>
        <span className="mt-2 block text-xl font-bold">{first}</span>
        {look.label ? (
          <span className="flex items-center justify-center gap-1 text-sm font-semibold" style={{ color: 'var(--pv-muted)' }}>
            <RoomIcon size={13} aria-hidden="true" style={{ color: look.color }} /> {look.label}
          </span>
        ) : null}
        <span
          className="mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold text-white"
          style={{ backgroundColor: inAt ? 'var(--pv-teal)' : '#8a8378' }}
        >
          {inAt ? `Here since ${formatTime(inAt)}` : 'Not here yet'}
        </span>
      </button>
    </div>
  );
}

// ============================================================
// Family check-in grid
// ============================================================
const AUTO_RESET_SECONDS = 20;

function FamilyScreen({
  client,
  family,
  onDone,
}: {
  client: KioskClient;
  family: KioskFamily;
  onDone: () => void;
}) {
  const [success, setSuccess] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RESET_SECONDS);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    setSecondsLeft(AUTO_RESET_SECONDS);
    timer.current = setInterval(() => {
      setSecondsLeft((p) => {
        if (p <= 1) {
          if (timer.current) clearInterval(timer.current);
          onDone();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  }, [onDone]);

  useEffect(() => {
    start();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [start]);

  const lastName = primaryLastName(family.parents);

  return (
    <main className="pv-portal-bg min-h-[100dvh] px-4 py-6" onPointerDown={start}>
      <div className="mx-auto max-w-lg">
        <header className="pv-rise mb-6 flex items-center justify-between" style={{ animationDelay: '30ms' }}>
          <div>
            <h1 className="pv-tad-title text-3xl sm:text-4xl">{lastName ? `Welcome, ${lastName} family` : 'Welcome'}</h1>
            <p className="mt-1 text-base" style={{ color: 'var(--pv-muted)' }}>
              Tap a child to check them in or out.
            </p>
          </div>
          <span className="text-right text-sm" style={{ color: 'var(--pv-muted)' }}>
            resets in
            <span className="block text-2xl font-bold" style={{ color: 'var(--pv-ink)' }}>
              {secondsLeft}s
            </span>
          </span>
        </header>

        <div className="pv-rise" style={{ animationDelay: '60ms' }}>
          {family.children.length === 0 ? (
            <div className="pv-tile p-8 text-center" style={{ color: 'var(--pv-muted)' }}>
              No children on this account yet. Please see staff.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {family.children.map((child) => (
                <ChildTile key={child.id} client={client} child={child} familyId={family.id} onToggled={(m) => { setSuccess(m); start(); }} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <BigButton icon={Check} label="Done" color="var(--pv-plum)" onClick={onDone} className="w-full text-center" />
        </div>
      </div>
      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}

// ============================================================
// Root — PIN -> privacy gate -> family grid
// ============================================================
export default function KioskScreen({
  client,
  centerName = '',
}: {
  client: KioskClient;
  isDemo?: boolean;
  centerName?: string;
}) {
  const [activeFamily, setActiveFamily] = useState<KioskFamily | null>(null);
  const [pendingFamily, setPendingFamily] = useState<KioskFamily | null>(null);
  const [declined, setDeclined] = useState(false);

  // MN DCYF gate: a family must have a CURRENT privacy-notice agreement before
  // check-in. If not, show the notice; they cannot reach the grid until they agree.
  async function handlePinSuccess(family: KioskFamily) {
    const current = await client.getPrivacyAttestationStatus(family.id);
    if (current) setActiveFamily(family);
    else setPendingFamily(family);
  }

  if (declined) return <SeeStaffScreen onDone={() => setDeclined(false)} />;

  if (pendingFamily) {
    const name = primaryLastName(pendingFamily.parents) || pendingFamily.children[0]?.name || 'Family';
    return (
      <PrivacyNotice
        familyName={name}
        onAgree={async () => {
          await client.recordPrivacyAttestation(pendingFamily.id, name);
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
    <FamilyScreen client={client} family={activeFamily} onDone={() => setActiveFamily(null)} />
  ) : (
    <PinScreen client={client} centerName={centerName} onSuccess={handlePinSuccess} />
  );
}
