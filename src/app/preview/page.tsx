"use client";

import Link from "next/link";
import { playClick } from "@/lib/preview/sound";

// The preview index doubles as the walkthrough agenda (sit-down with
// Christina) and the self-guided tour (when she explores on her own).

const STEPS = [
  { href: "/preview/door", label: "The front door", detail: "One question, three doors. No login form." },
  { href: "/preview/kiosk", label: "Staff clock-in", detail: "Tap Staff, enter 7321, one tap to clock in." },
  { href: "/preview/kiosk", label: "Family check-in at the lobby", detail: "Enter 1234, tap a child in or out on the iPad." },
  { href: "/preview/room", label: "Teacher logs lunch", detail: "Pick any room, big buttons, log the whole room. Edit or remove anything after." },
  { href: "/preview/family", label: "The parent's phone", detail: "Sign in, see your kids, who is here, their day, what needs you." },
  { href: "/preview/meals", label: "Food counts", detail: "One row per child, two taps max." },
  { href: "/preview/schedule", label: "The week's schedule", detail: "Staff as rows, days as columns, copy last week." },
  { href: "/preview/newsletter", label: "Newsletter Monday", detail: "Stack three blocks, photos come from the feed." },
  { href: "/preview/office", label: "Christina's office", detail: "Five tiles, live room colors, edit mode." },
  { href: "/preview/office/people", label: "People", detail: "Add a person, reset a code. That is the whole screen." },
];

const SCREEN_GROUPS = [
  {
    place: "On the lobby iPad",
    note: "The screen by the front desk that everyone shares.",
    screens: [
      { href: "/preview/door", emoji: "🚪", label: "Front door" },
      { href: "/preview/kiosk", emoji: "🔢", label: "Code pad" },
    ],
  },
  {
    place: "On a parent's phone",
    note: "What a family opens at home or at work.",
    screens: [
      { href: "/preview/family", emoji: "📱", label: "Parent's phone" },
    ],
  },
  {
    place: "For teachers, in the room",
    note: "What staff use during the day.",
    screens: [
      { href: "/preview/room", emoji: "📋", label: "Room log" },
      { href: "/preview/meals", emoji: "🍽️", label: "Food counts" },
    ],
  },
  {
    place: "For the office",
    note: "Christina's view and the back-of-house tools.",
    screens: [
      { href: "/preview/office", emoji: "🗝️", label: "Office" },
      { href: "/preview/office/people", emoji: "🧑🏾‍🤝‍🧑🏾", label: "People" },
      { href: "/preview/schedule", emoji: "📅", label: "Schedule" },
      { href: "/preview/newsletter", emoji: "📰", label: "Newsletter" },
    ],
  },
];

export default function PreviewIndexPage() {
  return (
    <main className="px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: "var(--pv-coral)" }}>
          Summer revamp
        </p>
        <h1 className="pv-display mt-2 text-4xl sm:text-5xl">Summer Version 1</h1>
        <p className="mt-4 text-lg" style={{ color: "#4d4d4d" }}>
          A simpler take on the daily tools, built from what we learned this past
          month. Three layers, each simplified: the family layer, the staff layer,
          and the director layer. This page maps every screen. Everything works,
          it is all demo data, and nothing touches the real center.
        </p>

        <Link
          href="/preview/landing"
          onClick={() => playClick()}
          className="pv-press mt-6 flex items-center gap-4 rounded-2xl p-5 text-white shadow-md"
          style={{ background: "linear-gradient(160deg, #c62828, #9e1f1f)" }}
        >
          <span aria-hidden="true" className="text-3xl">🚪</span>
          <span className="flex-1">
            <span className="block text-lg font-extrabold">See the landing page</span>
            <span className="block text-base" style={{ color: "rgba(255,255,255,0.9)" }}>
              How the front door would look on the real site
            </span>
          </span>
          <span aria-hidden="true" className="text-2xl">→</span>
        </Link>

        <div
          className="mt-6 rounded-2xl border-2 p-5"
          style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)" }}
        >
          <h2 className="text-xl">🔑 Demo codes</h2>
          <p className="mt-2 text-base" style={{ color: "#4d4d4d" }}>
            Staff: <b>7321</b> (Dana, Toddlers) · <b>7322</b> (Maria, Preschool) ·
            <b> 7324</b> (Keisha, Infants) · <b>7325</b> (Marcus, School Age) ·
            <b> 7323</b> (Tasha, floats). Families: <b>1234</b> (Brown) ·
            <b> 2345</b> (Garcia) · <b>3456</b> (Johnson). Office: <b>9999</b>{" "}
            (Christina). Every person here is made up.
          </p>
        </div>

        <div
          className="mt-4 rounded-2xl border-2 p-5"
          style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)" }}
        >
          <h2 className="text-xl">🧭 What is real today, and what is next</h2>
          <p className="mt-2 text-base" style={{ color: "#4d4d4d" }}>
            This preview shows the whole picture. Some of it the app already does,
            some is the shape of what comes next. Here is the honest split.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-extrabold" style={{ color: "var(--pv-teal)" }}>Live today</p>
              <ul className="mt-1 text-sm" style={{ color: "#4d473f" }}>
                <li>The daily feed of meals, naps, photos</li>
                <li>Photo gallery for your own kids</li>
                <li>Messages the center sends out</li>
                <li>Newsletters</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-extrabold" style={{ color: "var(--pv-gold)" }}>Shape shown here</p>
              <ul className="mt-1 text-sm" style={{ color: "#4d473f" }}>
                <li>Is my kid here, on my phone</li>
                <li>What I owe and pay</li>
                <li>Writing back to the teacher</li>
                <li>Forms to sign, closures, photo upload</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-extrabold" style={{ color: "var(--pv-coral)" }}>Still to build</p>
              <ul className="mt-1 text-sm" style={{ color: "#4d473f" }}>
                <li>Who is allowed to pick up (top safety gap)</li>
                <li>Real billing and documents screens</li>
                <li>Two-way messages that reach staff</li>
                <li>Secure photo storage</li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-sm" style={{ color: "var(--pv-muted)" }}>
            Nothing here touches the real site or the real database. This is a
            sealed preview with made-up families.
          </p>
        </div>

        <h2 className="mt-10 text-2xl">The 10-step walk</h2>
        <p className="mt-1 text-base" style={{ color: "var(--pv-muted)" }}>
          Follow these in order. Each screen also carries its own step note, so
          this works with Josh in the room or on your own.
        </p>
        <ol className="mt-4 flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <li key={`${step.href}-${i}`}>
              <Link
                href={step.href}
                onClick={() => playClick()}
                className="pv-press flex items-center gap-4 rounded-2xl border bg-[var(--pv-card)] p-4"
                style={{ borderColor: "var(--pv-line)" }}
              >
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white"
                  style={{ backgroundColor: "var(--pv-plum)" }}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block text-lg font-extrabold">{step.label}</span>
                  <span className="block text-base" style={{ color: "var(--pv-muted)" }}>
                    {step.detail}
                  </span>
                </span>
                <span aria-hidden="true" className="ml-auto text-2xl" style={{ color: "var(--pv-coral)" }}>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <h2 className="mt-10 text-2xl">All screens, by where they live</h2>
        <p className="mt-1 text-base" style={{ color: "var(--pv-muted)" }}>
          Three places: the iPad in the lobby, a parent&apos;s own phone, and the
          office. Same data, different screen for each.
        </p>
        <div className="mt-4 flex flex-col gap-6">
          {SCREEN_GROUPS.map((group) => (
            <div key={group.place}>
              <h3 className="text-lg font-extrabold">{group.place}</h3>
              <p className="text-sm" style={{ color: "var(--pv-muted)" }}>{group.note}</p>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {group.screens.map((screen) => (
                  <Link
                    key={screen.href + screen.label}
                    href={screen.href}
                    onClick={() => playClick()}
                    className="pv-press pv-target rounded-2xl border bg-[var(--pv-card)] p-4 text-center"
                    style={{ borderColor: "var(--pv-line)" }}
                  >
                    <span aria-hidden="true" className="block text-3xl">{screen.emoji}</span>
                    <span className="mt-1 block text-base font-extrabold">{screen.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm" style={{ color: "var(--pv-muted)" }}>
          Built as a sealed preview. No real names, no real data, no connection
          to the live site or database. Feedback lands in docs/preview/FEEDBACK.md.
        </p>
      </div>
    </main>
  );
}
