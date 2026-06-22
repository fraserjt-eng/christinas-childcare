'use client';

// Live kiosk. All data goes through the locked, service-role /api/kiosk route.
// The browser has no direct database access here.
//
// Multi-center: each kiosk device is bound to ONE center via its URL
// (/kiosk?center=<centerId>). That center is sent with every call so the server
// scopes the family lookup and attendance to it — a kiosk can never reach
// another center's data, and a family's PIN only resolves at its own center.
//
// If the URL has no ?center, we no longer silently default to one site (that
// made another center's PINs "not work"). Instead we ask which location first,
// then bind the device URL to it so it stays that site on this iPad.

import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin } from 'lucide-react';
import KioskScreen from '@/components/kiosk/KioskScreen';
import { makeLiveKioskClient } from '@/lib/kiosk-data';
// The new kiosk design uses the portal (pv-*) design system. The kiosk runs
// outside the /preview layout, so pull the stylesheet in here.
import '../preview/preview.css';

const CENTERS = [
  { id: '3104ae69-4f26-4c1e-a767-3ff45b534860', name: 'Brooklyn Park', address: '7000 Brooklyn Blvd' },
  { id: 'b2000000-0000-0000-0000-000000000002', name: 'Crystal', address: '5510 W Broadway Ave' },
];

function CenterPicker() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-christina-red via-[#a51f1f] to-[#7d1818] p-6">
      <h1 className="mb-2 font-playful text-3xl text-white">Which location?</h1>
      <p className="mb-8 font-body text-sm text-white/80">Tap this center once. This iPad will stay set to it.</p>
      <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
        {CENTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => router.replace(`/kiosk?center=${c.id}`)}
            className="flex flex-col items-start rounded-3xl bg-white p-6 text-left shadow-2xl transition hover:-translate-y-1"
          >
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-christina-red/10">
              <MapPin className="h-6 w-6 text-christina-red" />
            </span>
            <span className="font-heading text-xl font-bold text-gray-900">{c.name}</span>
            <span className="mt-1 font-body text-sm text-gray-500">{c.address}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function KioskInner() {
  const params = useSearchParams();
  const center = params.get('center') || undefined;
  // When a signed-in parent reaches the kiosk from their family page, the link
  // carries ?from=portal so we skip the lobby framing and send them back to
  // their portal after they finish (instead of resetting to a blank pad).
  const fromPortal = params.get('from') === 'portal';
  const client = useMemo(() => (center ? makeLiveKioskClient(center) : null), [center]);
  const centerName = CENTERS.find((c) => c.id === center)?.name || '';
  if (!center || !client) return <CenterPicker />;
  return <KioskScreen client={client} centerName={centerName} fromPortal={fromPortal} />;
}

export default function KioskPage() {
  return (
    <Suspense fallback={null}>
      <KioskInner />
    </Suspense>
  );
}
