'use client';

// Parent portal entry (v1): a family enters its kiosk PIN for ITS site and lands
// on the family home page. Same PIN + same design as the check-in kiosk, so the
// two are congruent. Site is chosen explicitly every time (never a sticky
// cookie), so a Brooklyn Park family is never locked to Crystal and vice versa.

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Delete, MapPin } from 'lucide-react';
import { cx } from '@/components/preview/ui';
// The parent portal uses the portal (pv-*) design system, like the kiosk.
import '../preview/preview.css';

const CENTERS = [
  { id: '3104ae69-4f26-4c1e-a767-3ff45b534860', name: 'Brooklyn Park' },
  { id: 'b2000000-0000-0000-0000-000000000002', name: 'Crystal' },
];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

function ParentPinInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [picked, setPicked] = useState<string>('');
  // Site comes from the link (?center) or an explicit pick. NEVER the sticky
  // cc_center cookie — that locked the parent portal to one site.
  const center = useMemo(() => params.get('center') || picked, [params, picked]);
  const centerName = CENTERS.find((c) => c.id === center)?.name || '';

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (value: string) => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/parent-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: value, centerId: center }),
        });
        if (!res.ok) {
          setShake(true);
          setError(res.status === 429 ? 'Too many tries. Please wait a few minutes.' : 'That PIN was not found at this center.');
          setTimeout(() => {
            setShake(false);
            setPin('');
            setError('');
          }, 800);
          setLoading(false);
          return;
        }
        router.push('/preview/family');
      } catch {
        setError('Connection error. Please try again.');
        setLoading(false);
      }
    },
    [center, router]
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

  // Step 1: pick the site (explicit, every time).
  if (!center) {
    return (
      <div className="pv-root">
        <main className="pv-portal-bg flex min-h-[100dvh] flex-col items-center justify-center px-4 py-6">
          <header className="pv-rise mb-8 text-center" style={{ animationDelay: '30ms' }}>
            <h1 className="pv-tad-title text-4xl sm:text-5xl">Christina&apos;s Child Care</h1>
            <p className="mt-3 text-lg font-semibold" style={{ color: 'var(--pv-muted)' }}>
              Which location is your child at?
            </p>
          </header>
          <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
            {CENTERS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPicked(c.id)}
                className="pv-tile pv-lift p-6 text-left"
              >
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--pv-coral) 12%, white)' }}>
                  <MapPin className="h-6 w-6" style={{ color: 'var(--pv-coral)' }} />
                </span>
                <span className="pv-tad-title block text-2xl">{c.name}</span>
              </button>
            ))}
          </div>
          <Link href="/start" className="mt-6 text-sm" style={{ color: 'var(--pv-muted)' }}>
            ← All portals
          </Link>
        </main>
      </div>
    );
  }

  // Step 2: enter the family PIN.
  return (
    <div className="pv-root">
      <main className="pv-portal-bg flex min-h-[100dvh] flex-col items-center justify-center px-4 py-6">
        <div className="relative mx-auto w-full max-w-md">
          {centerName ? (
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center">
              <span
                className="pv-tad-title text-center"
                style={{ fontSize: 'clamp(4.5rem, 22vw, 15rem)', lineHeight: 1, color: 'var(--pv-coral)', opacity: 0.22, textShadow: '0 0 60px var(--pv-coral), 0 0 120px var(--pv-coral)', whiteSpace: 'nowrap' }}
              >
                {centerName}
              </span>
            </div>
          ) : null}
          <header className="pv-rise relative z-10 mb-6 text-center" style={{ animationDelay: '30ms' }}>
            <h1 className="pv-tad-title text-4xl sm:text-5xl">Parent sign-in</h1>
            <p className="mt-2 text-lg font-semibold" style={{ color: 'var(--pv-muted)' }}>
              {centerName}
            </p>
          </header>
          <div
            className={cx('pv-tile relative z-10 p-7 text-center sm:p-8', shake && 'pv-shake')}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.42)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--pv-coral) 12%, white)' }} aria-hidden="true">
              <KeyRound size={26} style={{ color: 'var(--pv-coral)' }} />
            </span>
            <h2 className="pv-tad-title mt-4 text-3xl">Enter your family PIN</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--pv-muted)' }}>
              The same PIN you use at the check-in kiosk.
            </p>
            <div className="mt-6 flex justify-center gap-4" aria-label={`${pin.length} of 4 digits entered`}>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="h-5 w-5 rounded-full border-2" style={{ borderColor: 'var(--pv-coral)', backgroundColor: i < pin.length ? 'var(--pv-coral)' : 'transparent' }} />
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
          <div className="mt-6 flex justify-center gap-4 text-sm" style={{ color: 'var(--pv-muted)' }}>
            <button type="button" onClick={() => { setPicked(''); setPin(''); }} className="underline">
              Change location
            </button>
            <Link href="/login" className="underline" style={{ color: 'var(--pv-sky)' }}>
              Use email instead
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ParentPinPage() {
  return (
    <Suspense fallback={null}>
      <ParentPinInner />
    </Suspense>
  );
}
