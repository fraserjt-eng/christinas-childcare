'use client';

// Demo kiosk. Same UI as the live kiosk, but the demoKioskClient reads/writes
// the demo_* tables with the anon key. Fabricated data only.

import KioskScreen from '@/components/kiosk/KioskScreen';
import { demoKioskClient } from '@/lib/kiosk-data';

export default function DemoKioskPage() {
  return <KioskScreen client={demoKioskClient} isDemo />;
}
