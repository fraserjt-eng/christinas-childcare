'use client';

// The single, clear access point. Step 1: choose your location (sets the
// cc_center cookie so everything downstream is that site). Step 2: pick one of
// four doors:
//   - Kiosk         family check in / out (PIN, no login) -> /kiosk?center=
//   - Staff portal  staff sign-in (PIN now, OAuth later)  -> /employee-login
//   - Parent portal family PIN -> the parent home page     -> /parent-pin?center=
//   - Admin portal  owner / director back office           -> /admin-login

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Baby, Users, Heart, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const CENTERS = [
  { id: '3104ae69-4f26-4c1e-a767-3ff45b534860', name: 'Brooklyn Park', address: '7000 Brooklyn Blvd, Brooklyn Park, MN' },
  { id: 'b2000000-0000-0000-0000-000000000002', name: 'Crystal', address: '5510 W Broadway Ave, Crystal, MN' },
];

function readCookieCenter(): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(/(?:^|;\s*)cc_center=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

interface Door {
  key: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  go: (centerId: string) => string;
  tint: string;
}
const DOORS: Door[] = [
  { key: 'kiosk', title: 'Kiosk', desc: 'Family check in & out', icon: Baby, go: (c) => `/kiosk?center=${c}`, tint: 'bg-christina-red/10 text-christina-red' },
  { key: 'staff', title: 'Staff portal', desc: 'Clock in & your day', icon: Users, go: () => '/employee-login', tint: 'bg-christina-blue/10 text-christina-blue' },
  { key: 'parent', title: 'Parent portal', desc: "Your child's day", icon: Heart, go: (c) => `/parent-pin?center=${c}`, tint: 'bg-[#FF7043]/10 text-[#FF7043]' },
  { key: 'admin', title: 'Admin portal', desc: 'Owner & director', icon: ShieldCheck, go: () => '/admin-login', tint: 'bg-christina-green/10 text-christina-green' },
];

export default function StartPage() {
  const router = useRouter();
  const [center, setCenter] = useState<string>(() => readCookieCenter());
  const centerName = useMemo(() => CENTERS.find((c) => c.id === center)?.name || '', [center]);

  function chooseCenter(id: string) {
    document.cookie = `cc_center=${id}; path=/; max-age=86400; samesite=lax`;
    setCenter(id);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-christina-red via-[#a51f1f] to-[#7d1818]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-32 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-28 top-1/3 h-[380px] w-[380px] rounded-full bg-christina-yellow/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-16">
        <div className="mb-9 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-black/20">
            <Heart className="h-10 w-10 text-christina-red" strokeWidth={2} fill="currentColor" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Christina&apos;s Child Care Center</p>
          <h1 className="font-playful text-4xl leading-tight text-white sm:text-5xl">
            {center ? 'How can we help?' : 'Which location?'}
          </h1>
          {center ? (
            <button onClick={() => setCenter('')} className="mx-auto mt-3 inline-flex items-center gap-1.5 font-body text-sm text-white/85 hover:text-white">
              <MapPin className="h-4 w-4" /> {centerName}
              <span className="ml-1 inline-flex items-center gap-1 underline"><ArrowLeft className="h-3 w-3" /> change</span>
            </button>
          ) : (
            <p className="mx-auto mt-3 max-w-md font-body text-base text-white/85">Choose your center to begin.</p>
          )}
        </div>

        {!center ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {CENTERS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => chooseCenter(c.id)}
                className="group flex flex-col items-start rounded-3xl bg-white p-7 text-left shadow-2xl shadow-black/20 transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-christina-red/10">
                  <MapPin className="h-7 w-7 text-christina-red" />
                </span>
                <span className="font-heading text-2xl font-bold text-gray-900">{c.name}</span>
                <span className="mt-1 font-body text-sm text-gray-500">{c.address}</span>
                <span className="mt-5 inline-flex items-center gap-2 font-heading text-base font-bold text-christina-red">
                  Choose <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {DOORS.map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => router.push(d.go(center))}
                  className="group flex flex-col items-start rounded-3xl bg-white p-6 text-left shadow-2xl shadow-black/20 transition-transform duration-200 hover:-translate-y-1"
                >
                  <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${d.tint}`}>
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="font-heading text-xl font-bold text-gray-900">{d.title}</span>
                  <span className="mt-1 font-body text-sm text-gray-500">{d.desc}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-heading text-sm font-bold text-christina-red opacity-0 transition group-hover:opacity-100">
                    Open <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
