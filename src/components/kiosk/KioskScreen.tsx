'use client';

// LIVE kiosk — the SAME design as the /preview/kiosk we built, on REAL data.
//
// The kiosk runs OPEN on the lobby iPad (no session), so it cannot use the
// preview store the signed-in /preview screens use. It renders the identical
// look directly from the real, center-scoped /api/kiosk client. The whole tree
// is wrapped in `.pv-root` so the portal (pv-*) design tokens resolve outside
// the /preview layout. A faded, glowing center-name watermark sits behind the
// keypad. Flow: PIN pad -> MN DCYF privacy gate -> family check-in grid.

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  FamilyChildRow,
  AttendanceRow,
} from '@/lib/kiosk-data';
import { PrivacyNotice, SeeStaffScreen } from './PrivacyNotice';
import { BigButton, SuccessBanner, cx } from '@/components/preview/ui';
import { PhotoAvatar } from '@/components/preview/PhotoAvatar';
import { centerTime } from '@/lib/center-time';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

function formatTime(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : centerTime(d);
}

function familyLabel(family: KioskFamily): string {
  const primary = family.parents.find((p) => p.is_primary) || family.parents[0];
  if (primary?.name) {
    const parts = primary.name.trim().split(/\s+/);
    const last = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    return `${last} Family`;
  }
  // Kiosk-only roster stub (no guardian yet): label by the child's name.
  return family.children[0]?.name || 'Welcome';
}

// A real child carries a free-text classroom (not a fixtures roomId). Map common
// age-group words to the room look so the cards keep the design's color + icon.
function roomLook(classroom: string | null): { icon: LucideIcon; color: string; label: string } {
  const c = (classroom || '').toLowerCase();
  if (/infant|baby|nursery/.test(c)) return { icon: Baby, color: 'var(--pv-sky)', label: classroom || '' };
  if (/toddler/.test(c)) return { icon: Blocks, color: 'var(--pv-teal)', label: classroom || '' };
  if (/pre|pk/.test(c)) return { icon: Palette, color: 'var(--pv-plum)', label: classroom || '' };
  if (/school|kinder|age/.test(c)) return { icon: Backpack, color: 'var(--pv-gold)', label: classroom || '' };
  return { icon: Baby, color: 'var(--pv-coral)', label: classroom || '' };
}

// ---- PIN pad (with the center-name watermark behind it) ----
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
    <main className="pv-portal-bg relative min-h-[100dvh] overflow-hidden px-4 py-6">
      <div className="relative z-10 mx-auto max-w-2xl">
        <header className="pv-rise mb-8 text-center" style={{ animationDelay: '30ms' }}>
          <h1 className="pv-tad-title text-4xl sm:text-5xl">Christina&apos;s Child Care</h1>
          <p className="mt-3 text-lg font-semibold" style={{ color: 'var(--pv-muted)' }}>
            {centerName ? centerName : 'Enter your family PIN to check in or out.'}
          </p>
        </header>

        <div className="pv-rise relative" style={{ animationDelay: '60ms' }}>
          {/* Center-name watermark: faded + glowing, centered behind the keypad. */}
          {centerName ? (
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center">
              <span
                className="pv-tad-title text-center"
                style={{
                  fontSize: 'clamp(4.5rem, 22vw, 15rem)',
                  lineHeight: 1,
                  color: 'var(--pv-coral)',
                  opacity: 0.22,
                  textShadow: '0 0 60px var(--pv-coral), 0 0 120px var(--pv-coral)',
                  whiteSpace: 'nowrap',
                }}
              >
                {centerName}
              </span>
            </div>
          ) : null}
          <div
            className={cx('pv-tile relative z-10 mx-auto max-w-md p-7 text-center sm:p-8', shake && 'pv-shake')}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.42)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
          >
            <span
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'color-mix(in srgb, var(--pv-coral) 12%, white)' }}
              aria-hidden="true"
            >
              <KeyRound size={26} style={{ color: 'var(--pv-coral)' }} />
            </span>
            <h2 className="pv-tad-title mt-4 text-3xl">Enter your code</h2>
            <div className="mt-6 flex justify-center gap-4" aria-label={`${pin.length} of 4 digits entered`}>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-5 w-5 rounded-full border-2"
                  style={{ borderColor: 'var(--pv-coral)', backgroundColor: i < pin.length ? 'var(--pv-coral)' : 'transparent' }}
                />
              ))}
            </div>
            {error ? (
              <p className="mt-4 text-base font-bold" style={{ color: 'var(--pv-coral)' }}>
                {error}
              </p>
            ) : null}
            <div className="mx-auto mt-8 grid w-fit grid-cols-3 gap-4">
              {KEYS.map((key, i) =>
                key ? (
                  <button
                    key={`${key}-${i}`}
                    type="button"
                    onClick={() => press(key)}
                    disabled={loading}
                    className="pv-press flex h-[76px] w-[76px] items-center justify-center rounded-2xl border text-3xl font-semibold disabled:opacity-50"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.55)', borderColor: 'var(--pv-line)', color: 'var(--pv-ink)' }}
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
      </div>

      <div className="absolute bottom-3 right-4 z-10">
        <Link href="/admin-login" className="text-xs" style={{ color: 'var(--pv-muted)' }}>
          Admin
        </Link>
      </div>
    </main>
  );
}

// ---- child tile (mirrors the /preview/kiosk kid card; real check-in) ----
function ChildTile({
  client,
  child,
  familyId,
  signerName,
  onToggled,
}: {
  client: KioskClient;
  child: FamilyChildRow;
  familyId: string;
  signerName: string;
  onToggled: (msg: string) => void;
}) {
  const [att, setAtt] = useState<AttendanceRow | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    client.getTodayAttendance(child.id).then((r) => {
      setAtt(r);
      setLoaded(true);
    });
  }, [client, child.id]);

  const inAt = att?.check_in && !att?.check_out ? att.check_in : null;
  const look = roomLook(child.classroom);
  const RoomIcon = look.icon;
  const first = child.name.split(/\s+/)[0];

  async function toggle() {
    if (busy) return;
    setBusy(true);
    if (inAt) await client.checkOut(child.id, familyId, signerName.trim() || undefined);
    else await client.checkIn(child, familyId, signerName.trim() || undefined);
    setAtt(await client.getTodayAttendance(child.id));
    setBusy(false);
    onToggled(inAt ? `${first} is checked out. See you tomorrow!` : `${first} is checked in. Have a great day!`);
  }

  if (!loaded) return <div className="pv-tile h-44 animate-pulse" />;

  return (
    <div
      className="pv-lift rounded-lg border p-4 text-center"
      style={{ borderColor: inAt ? 'var(--pv-teal)' : 'var(--pv-line)', backgroundColor: inAt ? '#e7f4f2' : 'var(--pv-card)' }}
    >
      <button type="button" onClick={toggle} disabled={busy} className="pv-press pv-kiosk-target w-full disabled:opacity-60">
        <span className="block">
          <PhotoAvatar id={child.id} name={child.name} size={80} rounded="rounded-lg" className={cx('mx-auto', inAt ? '' : 'opacity-75 grayscale')} />
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

// ---- family check-in grid (mirrors /preview/kiosk family screen) ----
const AUTO_RESET_SECONDS = 25;

function FamilyScreen({ client, family, onDone }: { client: KioskClient; family: KioskFamily; onDone: () => void }) {
  const [success, setSuccess] = useState<string | null>(null);
  // Who is dropping off / picking up — fills the DCYF Sign In/Out Person column.
  const [signer, setSigner] = useState('');
  const [other, setOther] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adultNames = Array.from(new Set((family.parents || []).map((p) => (p.name || '').trim()).filter(Boolean)));

  // Silent privacy auto-reset: clear the family from the screen after inactivity.
  const bump = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(onDone, AUTO_RESET_SECONDS * 1000);
  }, [onDone]);

  useEffect(() => {
    bump();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [bump]);

  return (
    <main className="pv-portal-bg min-h-[100dvh] px-4 py-6" onPointerDown={bump}>
      <div className="mx-auto max-w-2xl">
        <header className="pv-rise mb-8 text-center" style={{ animationDelay: '30ms' }}>
          <h1 className="pv-tad-title text-4xl sm:text-5xl">Christina&apos;s Child Care</h1>
        </header>
        <div className="pv-rise" style={{ animationDelay: '60ms' }}>
          <div className="pv-tile mx-auto max-w-lg p-6 sm:p-7">
            <div className="text-center">
              <span className="inline-block">
                <PhotoAvatar id={family.id} name={familyLabel(family)} size={80} rounded="rounded-2xl" />
              </span>
              <h2 className="pv-tad-title mt-2 text-3xl">{familyLabel(family)}</h2>
              <p className="mt-1 text-lg" style={{ color: 'var(--pv-muted)' }}>
                Tap a child to check them in or out.
              </p>
            </div>
            {family.children.length > 0 ? (
              <div className="mt-5 rounded-xl border p-3" style={{ borderColor: 'var(--pv-line)' }}>
                <p className="text-center text-base font-bold" style={{ color: 'var(--pv-ink)' }}>
                  Who&apos;s here? Tap your name.
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {adultNames.map((name) => {
                    const on = !other && signer === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => { setOther(false); setSigner(name); }}
                        className="pv-press rounded-full border px-4 py-2 text-base font-semibold"
                        style={on
                          ? { backgroundColor: 'var(--pv-teal)', color: '#fff', borderColor: 'var(--pv-teal)' }
                          : { borderColor: 'var(--pv-line)', color: 'var(--pv-ink)' }}
                      >
                        {name}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => { setOther(true); setSigner(''); }}
                    className="pv-press rounded-full border px-4 py-2 text-base font-semibold"
                    style={other
                      ? { backgroundColor: 'var(--pv-teal)', color: '#fff', borderColor: 'var(--pv-teal)' }
                      : { borderColor: 'var(--pv-line)', color: 'var(--pv-ink)' }}
                  >
                    Other
                  </button>
                </div>
                {other ? (
                  <input
                    type="text"
                    value={signer}
                    onChange={(e) => setSigner(e.target.value)}
                    placeholder="Type the full name"
                    className="mx-auto mt-2 block w-full max-w-xs rounded-lg border px-4 py-2 text-lg"
                    style={{ borderColor: 'var(--pv-line)', color: 'var(--pv-ink)', backgroundColor: 'var(--pv-card)' }}
                  />
                ) : null}
              </div>
            ) : null}
            {family.children.length === 0 ? (
              <p className="mt-6 text-center text-lg" style={{ color: 'var(--pv-muted)' }}>
                No children on this account yet. Please see staff.
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {family.children.map((child) => (
                  <ChildTile key={child.id} client={client} child={child} familyId={family.id} signerName={signer} onToggled={(m) => { setSuccess(m); bump(); }} />
                ))}
              </div>
            )}
            <div className="mt-6">
              <BigButton icon={Check} label="Done" color="var(--pv-plum)" onClick={onDone} className="w-full text-center" />
            </div>
          </div>
        </div>
      </div>
      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}

// ---- root: PIN -> privacy gate -> family grid (wrapped in .pv-root) ----
export default function KioskScreen({ client, centerName = '', fromPortal = false }: { client: KioskClient; isDemo?: boolean; centerName?: string; fromPortal?: boolean }) {
  const router = useRouter();
  const [activeFamily, setActiveFamily] = useState<KioskFamily | null>(null);
  const [pendingFamily, setPendingFamily] = useState<KioskFamily | null>(null);
  const [declined, setDeclined] = useState(false);
  // A parent who came from their own family page goes back there when finished;
  // the shared lobby iPad instead resets to a blank pad for the next family.
  const closeFamily = fromPortal ? () => router.push('/preview/family') : () => setActiveFamily(null);

  async function handlePinSuccess(family: KioskFamily) {
    const current = await client.getPrivacyAttestationStatus(family.id);
    if (current) setActiveFamily(family);
    else setPendingFamily(family);
  }

  let body: React.ReactNode;
  if (declined) {
    body = <SeeStaffScreen onDone={() => setDeclined(false)} />;
  } else if (pendingFamily) {
    const name = familyLabel(pendingFamily);
    body = (
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
  } else if (activeFamily) {
    body = <FamilyScreen client={client} family={activeFamily} onDone={closeFamily} />;
  } else {
    body = <PinScreen client={client} centerName={centerName} onSuccess={handlePinSuccess} />;
  }

  // .pv-root makes the portal design tokens (--pv-*) resolve outside /preview.
  return (
    <div className="pv-root">
      {fromPortal ? (
        <div className="pv-portal-bg px-4 pt-4">
          <Link
            href="/preview/family"
            className="pv-press inline-flex items-center gap-1 text-sm font-bold"
            style={{ color: 'var(--pv-muted)' }}
          >
            ← Back to my family page
          </Link>
        </div>
      ) : null}
      {body}
    </div>
  );
}
