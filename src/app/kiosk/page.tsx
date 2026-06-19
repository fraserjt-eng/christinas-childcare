'use client';

// Live kiosk. All data goes through the locked, service-role /api/kiosk route.
// The browser has no direct database access here.
//
// Multi-center: each kiosk device is bound to ONE center via its bookmarked URL
// (/kiosk?center=<centerId>). That center is sent with every call so the server
// scopes the family lookup and attendance to it — a kiosk can never reach
// another center's data. No ?center => the server defaults to the operating
// center (back-compat for the existing single-center kiosk).

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import KioskScreen from '@/components/kiosk/KioskScreen';
import { makeLiveKioskClient } from '@/lib/kiosk-data';

function KioskInner() {
  const params = useSearchParams();
  const center = params.get('center') || undefined;
  const client = useMemo(() => makeLiveKioskClient(center), [center]);
  return <KioskScreen client={client} />;
}

export default function KioskPage() {
  return (
    <Suspense fallback={null}>
      <KioskInner />
    </Suspense>
  );
}
