"use client";

// The landing page as it would look on the real site: the branded front door
// of the simplified experience. Not the demo walkthrough (that is /preview).
// This is what a family or a staff member would land on. Brand-matched to
// Christina's Child Care: red, Nunito and Fredoka, the real palette.

import Link from "next/link";
import { playClick } from "@/lib/preview/sound";

const DOORS = [
  {
    href: "/preview/family",
    emoji: "👨🏾‍👩🏾‍👧🏾",
    title: "For families",
    body: "See your child's day as it happens: who is here, meals and naps, photos, and a note from the room.",
    cta: "Open the family app",
    color: "#c62828",
  },
  {
    href: "/preview/kiosk",
    emoji: "🧑🏾‍🏫",
    title: "For staff",
    body: "Clock in with your code, then log your room in a tap. Meals, naps, bottles, photos, all from one screen.",
    cta: "Go to the staff view",
    color: "#2e9e4f",
  },
  {
    href: "/preview/office",
    emoji: "🗝️",
    title: "For the office",
    body: "Christina's simple view of the whole center: who is in each room, billing, messages, and the day at a glance.",
    cta: "Open the office",
    color: "#1f7fd4",
  },
];

const FEATURES = [
  { emoji: "🟢", title: "Is my kid here", body: "A green check the moment they are dropped off." },
  { emoji: "📸", title: "Photos and updates", body: "The day, as it happens, straight to the family." },
  { emoji: "💬", title: "Message the room", body: "Families and teachers, talking in one place." },
  { emoji: "🍎", title: "One tap to log", body: "Meals, naps, and counts without the paperwork." },
];

export default function LandingPage() {
  return (
    <main>
      {/* HERO */}
      <section
        className="px-6 py-16 text-center sm:py-20"
        style={{ background: "linear-gradient(160deg, #c62828, #9e1f1f)" }}
      >
        <p className="text-sm font-extrabold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.8)" }}>
          Christina&apos;s Child Care Center
        </p>
        <h1 className="pv-display mx-auto mt-3 max-w-3xl text-4xl text-white sm:text-6xl">
          Your child&apos;s whole day, in one simple place
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: "rgba(255,255,255,0.92)" }}>
          A calmer, simpler way to run the day for families, teachers, and the
          office. Built to be easy on the very first try.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/preview/family"
            onClick={() => playClick()}
            className="pv-press pv-kiosk-target rounded-2xl bg-white px-6 py-4 text-lg font-extrabold shadow-md"
            style={{ color: "#c62828" }}
          >
            I&apos;m a family
          </Link>
          <Link
            href="/preview/kiosk"
            onClick={() => playClick()}
            className="pv-press pv-kiosk-target rounded-2xl px-6 py-4 text-lg font-extrabold text-white shadow-md"
            style={{ backgroundColor: "rgba(255,255,255,0.16)" }}
          >
            I&apos;m staff
          </Link>
        </div>
      </section>

      {/* THREE DOORS */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl sm:text-3xl">Choose how you are here</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {DOORS.map((door) => (
              <Link
                key={door.title}
                href={door.href}
                onClick={() => playClick()}
                className="pv-press rounded-2xl border bg-[var(--pv-card)] p-6 text-center shadow-sm"
                style={{ borderColor: "var(--pv-line)" }}
              >
                <span
                  aria-hidden="true"
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
                  style={{ backgroundColor: `${door.color}1a` }}
                >
                  {door.emoji}
                </span>
                <h3 className="mt-4 text-xl">{door.title}</h3>
                <p className="mt-2 text-base" style={{ color: "#4d4d4d" }}>{door.body}</p>
                <span
                  className="mt-4 inline-block rounded-full px-4 py-2 text-base font-extrabold text-white"
                  style={{ backgroundColor: door.color }}
                >
                  {door.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-12" style={{ backgroundColor: "#f1ece3" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl sm:text-3xl">Built to be simple</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 rounded-2xl border bg-[var(--pv-card)] p-5"
                style={{ borderColor: "var(--pv-line)" }}
              >
                <span aria-hidden="true" className="text-3xl">{f.emoji}</span>
                <div>
                  <h3 className="text-lg">{f.title}</h3>
                  <p className="mt-1 text-base" style={{ color: "#4d4d4d" }}>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className="px-4 py-12 text-center">
        <h2 className="pv-display text-2xl" style={{ color: "#c62828" }}>Christina&apos;s Child Care Center</h2>
        <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
          Brooklyn Park, Minnesota. A simpler way to run the day.
        </p>
        <Link
          href="/preview"
          onClick={() => playClick()}
          className="pv-press pv-target mt-6 inline-block rounded-xl px-4 py-2 text-base font-bold"
          style={{ color: "var(--pv-plum)" }}
        >
          ← Back to the walkthrough
        </Link>
      </section>
    </main>
  );
}
