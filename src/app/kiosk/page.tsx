'use client';

// Live kiosk. All data goes through the locked, service-role /api/kiosk route
// (liveKioskClient). The browser has no direct database access here.

import KioskScreen from '@/components/kiosk/KioskScreen';
import { liveKioskClient } from '@/lib/kiosk-data';

export default function KioskPage() {
  return <KioskScreen client={liveKioskClient} />;
}
