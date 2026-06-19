"use client";

// The landing page as it would look on the real site: the branded front door
// of the simplified experience. Not the demo walkthrough (that is /preview).
// This is what a family or a staff member would land on. Brand-matched to
// Christina's Child Care: red, Nunito and Fredoka, the real palette.

import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  type LucideIcon,
  MessageSquare,
  Users,
  Utensils,
} from "lucide-react";
import { playClick } from "@/lib/preview/sound";

const DOORS: {
  href: string;
  icon: LucideIcon;
  title: string;
  body: string;
  cta: string;
  color: string;
}[] = [
  {
    href: "/preview/family",
    icon: Users,
    title: "Family account",
    body: "Sign in to see your child's day as it happens: who is here, meals and naps, photos, messages, and what you owe.",
    cta: "Open the family app",
    color: "var(--pv-coral)",
  },
  {
    href: "/preview/kiosk",
    icon: GraduationCap,
    title: "Staff account",
    body: "Sign in with your code to clock in and log any room: meals, naps, bottles, photos, all from one screen.",
    cta: "Go to the staff view",
    color: "var(--pv-teal)",
  },
  {
    href: "/preview/office",
    icon: KeyRound,
    title: "Office account",
    body: "Christina's view of the whole center: who is in each room, billing, messages, and the day at a glance.",
    cta: "Open the office",
    color: "var(--pv-sky)",
  },
];

const FEATURES: { icon: LucideIcon; color: string; title: string; body: string }[] = [
  { icon: CheckCircle2, color: "var(--pv-teal)", title: "Is my kid here", body: "A green check the moment they are dropped off." },
  { icon: Camera, color: "var(--pv-coral)", title: "Photos and updates", body: "The day, as it happens, straight to the family." },
  { icon: MessageSquare, color: "var(--pv-sky)", title: "Message the room", body: "Families and teachers, talking in one place." },
  { icon: Utensils, color: "var(--pv-gold)", title: "One tap to log", body: "Meals, naps, and counts without the paperwork." },
];

export default function LandingPage() {
  return (
    <main style={{ backgroundColor: "var(--pv-paper)" }}>
      {/* HERO: light canvas, christina-red as a restrained accent (no full fill) */}
      <section className="pv-rise px-6 py-16 text-center sm:py-20" style={{ animationDelay: "60ms" }}>
        <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--pv-coral)" }}>
          Christina&apos;s Child Care Center
        </p>
        <h1 className="pv-tad-title mx-auto mt-3 max-w-3xl text-4xl sm:text-5xl">
          your child&apos;s whole day, in one simple place
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: "var(--pv-muted)" }}>
          A calmer, simpler way to run the day for families, teachers, and the
          office. Built to be easy on the very first try.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/preview/kiosk"
            onClick={() => playClick()}
            className="pv-press pv-kiosk-target inline-flex items-center gap-2 rounded-lg px-7 py-5 text-xl font-bold text-white shadow-sm"
            style={{ backgroundColor: "var(--pv-coral)" }}
          >
            <CheckCircle2 size={22} aria-hidden="true" /> Check in or out
          </Link>
          <Link
            href="/preview/family"
            onClick={() => playClick()}
            className="pv-press pv-kiosk-target inline-flex items-center gap-2 rounded-lg border bg-[var(--pv-card)] px-6 py-5 text-lg font-bold shadow-sm"
            style={{ borderColor: "var(--pv-line)", color: "var(--pv-ink)" }}
          >
            See my child&apos;s day
          </Link>
        </div>
        <p className="mt-4 text-base" style={{ color: "var(--pv-muted)" }}>
          Check in or out is the front-desk pad. Tap your code, tap your kids,
          done. No login needed.
        </p>
      </section>

      {/* ACCOUNTS */}
      <section className="pv-rise px-4 py-12" style={{ animationDelay: "120ms" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="pv-tad-title text-center text-2xl sm:text-3xl">sign in to your account</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-base" style={{ color: "var(--pv-muted)" }}>
            The full app, for when you want more than a quick check-in. Families
            see the day, staff log the room, the office runs the center.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {DOORS.map((door) => {
              const Icon = door.icon;
              return (
                <Link
                  key={door.title}
                  href={door.href}
                  onClick={() => playClick()}
                  className="pv-lift rounded-lg border bg-[var(--pv-card)] p-6 text-center shadow-sm"
                  style={{ borderColor: "var(--pv-line)" }}
                >
                  <span
                    aria-hidden="true"
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-md"
                    style={{ backgroundColor: `color-mix(in srgb, ${door.color} 12%, #fff)` }}
                  >
                    <Icon size={26} style={{ color: door.color }} />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold" style={{ color: "var(--pv-ink)" }}>{door.title}</h3>
                  <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>{door.body}</p>
                  <span
                    className="mt-4 inline-flex items-center gap-1.5 text-base font-bold"
                    style={{ color: door.color }}
                  >
                    {door.cta} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="pv-rise px-4 py-12" style={{ backgroundColor: "#f3f1ec", animationDelay: "180ms" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="pv-tad-title text-center text-2xl sm:text-3xl">built to be simple</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="pv-lift flex items-start gap-4 rounded-lg border bg-[var(--pv-card)] p-5 shadow-sm"
                  style={{ borderColor: "var(--pv-line)" }}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `color-mix(in srgb, ${f.color} 12%, #fff)` }}
                  >
                    <Icon size={22} style={{ color: f.color }} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: "var(--pv-ink)" }}>{f.title}</h3>
                    <p className="mt-1 text-base" style={{ color: "var(--pv-muted)" }}>{f.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className="pv-rise px-4 py-12 text-center" style={{ animationDelay: "240ms" }}>
        <h2 className="pv-tad-title text-2xl">christina&apos;s child care center</h2>
        <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
          Brooklyn Park, Minnesota. A simpler way to run the day.
        </p>
        <Link
          href="/preview"
          onClick={() => playClick()}
          className="pv-press pv-target mt-6 inline-block rounded-lg px-4 py-2 text-base font-bold"
          style={{ color: "var(--pv-coral)" }}
        >
          ← Back to the walkthrough
        </Link>
      </section>
    </main>
  );
}
