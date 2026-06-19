'use client';

// The portal entry: choose a center FIRST, then sign in. The choice is stored
// in the cc_center cookie, which the portal data endpoint honors for a director
// so the whole experience (sign-in branding + the watermark + the data) is
// that center. Staff are still locked to their own center server-side.

import { useRouter } from 'next/navigation';
import { MapPin, ArrowRight, Heart } from 'lucide-react';

const CENTERS = [
  {
    id: '3104ae69-4f26-4c1e-a767-3ff45b534860',
    name: 'Brooklyn Park',
    address: '7000 Brooklyn Blvd, Brooklyn Park, MN',
  },
  {
    id: 'b2000000-0000-0000-0000-000000000002',
    name: 'Crystal',
    address: '5510 W Broadway Ave, Crystal, MN',
  },
];

export default function StartPage() {
  const router = useRouter();

  function choose(id: string) {
    document.cookie = `cc_center=${id}; path=/; max-age=86400; samesite=lax`;
    router.push('/employee-login');
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-christina-red via-[#a51f1f] to-[#7d1818]">
      {/* Soft brand wash, like the home hero */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-[380px] w-[380px] rounded-full bg-christina-yellow/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-[460px] w-[460px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-16">
        {/* Masthead */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-black/20">
            <Heart className="h-10 w-10 text-christina-red" strokeWidth={2} fill="currentColor" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Christina&apos;s Child Care Center
          </p>
          <h1 className="font-playful text-4xl leading-tight text-white sm:text-5xl">
            Which center?
          </h1>
          <p className="mx-auto mt-3 max-w-md font-body text-base text-white/85">
            Choose your location to sign in.
          </p>
        </div>

        {/* Center cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {CENTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => choose(c.id)}
              className="group flex flex-col items-start rounded-3xl border-0 bg-white p-7 text-left shadow-2xl shadow-black/20 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]"
            >
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-christina-red/10">
                <MapPin className="h-7 w-7 text-christina-red" />
              </span>
              <span className="font-heading text-2xl font-bold text-gray-900">{c.name}</span>
              <span className="mt-1 font-body text-sm text-gray-500">{c.address}</span>
              <span className="mt-5 inline-flex items-center gap-2 font-heading text-base font-bold text-christina-red">
                Enter
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
