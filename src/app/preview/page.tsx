"use client";

import Link from "next/link";
import {
  Calendar,
  Compass,
  DoorOpen,
  KeyRound,
  type LucideIcon,
  Newspaper,
  Smartphone,
  ClipboardList,
  Utensils,
  Users,
  LayoutGrid,
  Building2,
} from "lucide-react";
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
  { href: "/preview/dashboard", label: "The center dashboard", detail: "Every room, live ratios, the IN/OUT grid. Tap a child in and watch it all move." },
  { href: "/preview/office/people", label: "People", detail: "Add a person, reset a code. That is the whole screen." },
];

const SCREEN_GROUPS: {
  place: string;
  note: string;
  screens: { href: string; icon: LucideIcon; label: string }[];
}[] = [
  {
    place: "On the lobby iPad",
    note: "The screen by the front desk that everyone shares.",
    screens: [
      { href: "/preview/door", icon: DoorOpen, label: "Front door" },
      { href: "/preview/kiosk", icon: KeyRound, label: "Code pad" },
    ],
  },
  {
    place: "On a parent's phone",
    note: "What a family opens at home or at work.",
    screens: [
      { href: "/preview/family", icon: Smartphone, label: "Parent's phone" },
    ],
  },
  {
    place: "For teachers, in the room",
    note: "What staff use during the day.",
    screens: [
      { href: "/preview/room", icon: ClipboardList, label: "Room log" },
      { href: "/preview/meals", icon: Utensils, label: "Food counts" },
    ],
  },
  {
    place: "For the office",
    note: "Christina's view and the back-of-house tools.",
    screens: [
      { href: "/preview/dashboard", icon: Building2, label: "Center dashboard" },
      { href: "/preview/office", icon: LayoutGrid, label: "Office" },
      { href: "/preview/office/people", icon: Users, label: "People" },
      { href: "/preview/schedule", icon: Calendar, label: "Schedule" },
      { href: "/preview/newsletter", icon: Newspaper, label: "Newsletter" },
    ],
  },
];

export default function PreviewIndexPage() {
  return (
    <main className="px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="pv-rise" style={{ animationDelay: "60ms" }}>
        <p className="pv-tad-label text-xs" style={{ color: "var(--pv-coral)" }}>
          summer revamp
        </p>
        <h1 className="pv-tad-title mt-2 text-4xl sm:text-5xl">summer version 1</h1>
        <p className="mt-4 text-lg" style={{ color: "var(--pv-muted)" }}>
          A simpler take on the daily tools, built from what we learned this past
          month. Three layers, each simplified: the family layer, the staff layer,
          and the director layer. This page maps every screen. Everything works,
          it is all demo data, and nothing touches the real center.
        </p>
        </header>

        <Link
          href="/preview/landing"
          onClick={() => playClick()}
          className="pv-lift pv-target mt-6 flex items-center gap-4 rounded-lg border p-5 shadow-sm"
          style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)" }}
        >
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: "rgba(198,40,40,0.12)" }}
          >
            <DoorOpen aria-hidden="true" size={24} style={{ color: "var(--pv-coral)" }} />
          </span>
          <span className="flex-1">
            <span className="block text-lg font-bold" style={{ color: "var(--pv-ink)" }}>See the landing page</span>
            <span className="block text-base" style={{ color: "var(--pv-muted)" }}>
              How the front door would look on the real site
            </span>
          </span>
          <span aria-hidden="true" className="text-2xl" style={{ color: "var(--pv-coral)" }}>→</span>
        </Link>

        <div
          className="pv-rise mt-6 rounded-lg border p-5 shadow-sm"
          style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)", animationDelay: "120ms" }}
        >
          <h2 className="pv-tad-title flex items-center gap-2 text-xl">
            <KeyRound aria-hidden="true" size={20} style={{ color: "var(--pv-coral)" }} />
            demo codes
          </h2>
          <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
            Staff: <b>7321</b> (Dana, Toddlers) · <b>7322</b> (Maria, Preschool) ·
            <b> 7324</b> (Keisha, Infants) · <b>7325</b> (Marcus, School Age) ·
            <b> 7323</b> (Tasha, floats). Families: <b>1234</b> (Brown) ·
            <b> 2345</b> (Garcia) · <b>3456</b> (Johnson). Office: <b>9999</b>{" "}
            (Christina). Every person here is made up.
          </p>
        </div>

        <div
          className="pv-rise mt-4 rounded-lg border p-5 shadow-sm"
          style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)", animationDelay: "180ms" }}
        >
          <h2 className="pv-tad-title flex items-center gap-2 text-xl">
            <Compass aria-hidden="true" size={20} style={{ color: "var(--pv-sky)" }} />
            what is real today, and what is next
          </h2>
          <p className="mt-2 text-base" style={{ color: "var(--pv-muted)" }}>
            This preview shows the whole picture. Some of it the app already does,
            some is the shape of what comes next. Here is the honest split.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-extrabold" style={{ color: "var(--pv-teal)" }}>Live today</p>
              <ul className="mt-1 text-sm" style={{ color: "var(--pv-ink)" }}>
                <li>The daily feed of meals, naps, photos</li>
                <li>Photo gallery for your own kids</li>
                <li>Messages the center sends out</li>
                <li>Newsletters</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-extrabold" style={{ color: "var(--pv-gold)" }}>Shape shown here</p>
              <ul className="mt-1 text-sm" style={{ color: "var(--pv-ink)" }}>
                <li>Is my kid here, on my phone</li>
                <li>What I owe and pay</li>
                <li>Writing back to the teacher</li>
                <li>Forms to sign, closures, photo upload</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-extrabold" style={{ color: "var(--pv-coral)" }}>Still to build</p>
              <ul className="mt-1 text-sm" style={{ color: "var(--pv-ink)" }}>
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

        <section className="pv-rise" style={{ animationDelay: "220ms" }}>
        <h2 className="pv-tad-title mt-10 text-2xl">the 10-step walk</h2>
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
                className="pv-lift pv-target flex items-center gap-4 rounded-lg border bg-[var(--pv-card)] p-4 shadow-sm"
                style={{ borderColor: "var(--pv-line)" }}
              >
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-lg font-bold"
                  style={{ backgroundColor: "rgba(198,40,40,0.12)", color: "var(--pv-coral)" }}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block text-lg font-bold" style={{ color: "var(--pv-ink)" }}>{step.label}</span>
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
        </section>

        <section className="pv-rise" style={{ animationDelay: "260ms" }}>
        <h2 className="pv-tad-title mt-10 text-2xl">all screens, by where they live</h2>
        <p className="mt-1 text-base" style={{ color: "var(--pv-muted)" }}>
          Three places: the iPad in the lobby, a parent&apos;s own phone, and the
          office. Same data, different screen for each.
        </p>
        <div className="mt-4 flex flex-col gap-6">
          {SCREEN_GROUPS.map((group) => (
            <div key={group.place}>
              <h3 className="pv-tad-label text-base" style={{ color: "var(--pv-ink)" }}>{group.place}</h3>
              <p className="text-sm" style={{ color: "var(--pv-muted)" }}>{group.note}</p>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {group.screens.map((screen) => {
                  const Icon = screen.icon;
                  return (
                    <Link
                      key={screen.href + screen.label}
                      href={screen.href}
                      onClick={() => playClick()}
                      className="pv-lift pv-target flex flex-col items-center rounded-lg border bg-[var(--pv-card)] p-4 text-center shadow-sm"
                      style={{ borderColor: "var(--pv-line)" }}
                    >
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-md"
                        style={{ backgroundColor: "rgba(198,40,40,0.10)" }}
                      >
                        <Icon aria-hidden="true" size={22} style={{ color: "var(--pv-coral)" }} />
                      </span>
                      <span className="mt-2 block text-base font-bold" style={{ color: "var(--pv-ink)" }}>{screen.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        </section>

        <p className="mt-10 text-sm" style={{ color: "var(--pv-muted)" }}>
          Built as a sealed preview. No real names, no real data, no connection
          to the live site or database. Feedback lands in docs/preview/FEEDBACK.md.
        </p>
      </div>
    </main>
  );
}
