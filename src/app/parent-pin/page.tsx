'use client';

// Parent portal entry (v1): a family enters its kiosk PIN for its center and
// lands on the family home page. Same PIN as the check-in kiosk. Site-aware:
// the center comes from ?center (set by the access page) or the cc_center
// cookie; if neither, the parent picks the site first.

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PinPad } from '@/components/employee/PinPad';
import { MapPin, Heart } from 'lucide-react';

const CENTERS = [
  { id: '3104ae69-4f26-4c1e-a767-3ff45b534860', name: 'Brooklyn Park' },
  { id: 'b2000000-0000-0000-0000-000000000002', name: 'Crystal' },
];

function readCookieCenter(): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(/(?:^|;\s*)cc_center=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

function ParentPinInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [picked, setPicked] = useState<string>('');
  const center = useMemo(() => params.get('center') || readCookieCenter() || picked, [params, picked]);
  const centerName = CENTERS.find((c) => c.id === center)?.name || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = useCallback(
    async (pin: string) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/auth/parent-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin, centerId: center }),
        });
        if (res.status === 429) {
          setError('Too many tries. Please wait a few minutes.');
          setLoading(false);
          return;
        }
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d.error || 'That PIN did not work. Please see staff.');
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

  // No center yet: pick the site first.
  if (!center) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-christina-blue/10 to-[#f5f0e8] p-6">
        <h1 className="mb-2 font-heading text-2xl font-bold text-gray-900">Which location?</h1>
        <p className="mb-6 text-sm text-muted-foreground">Choose your child&apos;s center.</p>
        <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
          {CENTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                document.cookie = `cc_center=${c.id}; path=/; max-age=86400; samesite=lax`;
                setPicked(c.id);
              }}
              className="flex flex-col items-start rounded-2xl bg-white p-5 text-left shadow-lg transition hover:-translate-y-0.5"
            >
              <MapPin className="mb-2 h-6 w-6 text-christina-red" />
              <span className="font-heading text-lg font-bold text-gray-900">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-christina-blue/10 to-[#f5f0e8] p-6">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-xl">
        <Heart className="h-8 w-8 text-christina-red" fill="currentColor" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-gray-900">Parent sign-in</h1>
      <p className="mb-1 text-sm text-muted-foreground">Enter your family PIN{centerName ? ` for ${centerName}` : ''}.</p>
      <p className="mb-6 text-xs text-muted-foreground">It&apos;s the same PIN you use at the check-in kiosk.</p>
      <div className="w-full max-w-xs">
        <PinPad onSubmit={onSubmit} error={error} loading={loading} maxLength={4} />
      </div>
      <div className="mt-6 flex gap-4 text-sm text-muted-foreground">
        <Link href="/start" className="hover:underline">← All portals</Link>
        <Link href="/login" className="text-christina-blue hover:underline">Use email instead</Link>
      </div>
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
