"use client";

// The three-door entry (design exploration section 01).
// One question, three doors. The PIN moment happens after the choice.

import Link from "next/link";
import { StepNote } from "@/components/preview/ui";
import { playClick } from "@/lib/preview/sound";

const DOORS = [
  {
    href: "/preview/kiosk",
    label: "Staff",
    sub: "Clock in or out",
    emoji: "🧑🏾‍🏫",
    color: "#2e9e4f",
  },
  {
    href: "/preview/office",
    label: "Office",
    sub: "Christina's view",
    emoji: "🗝️",
    color: "#c62828",
  },
  {
    href: "/preview/kiosk",
    label: "Families",
    sub: "Check your kids in or out",
    emoji: "👨🏾‍👩🏾‍👧🏾",
    color: "#f4a720",
  },
];

export default function DoorPage() {
  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <StepNote step={1} text="The front door. One question, three big doors." />
      </div>
      <div
        className="mx-auto mt-2 max-w-4xl rounded-3xl px-6 py-12 text-center sm:py-16"
        style={{ background: "linear-gradient(160deg, #1f2933, #33414d)" }}
      >
        <h1 className="pv-display text-3xl text-white sm:text-5xl">Good morning! Who&apos;s here?</h1>
        <div className="mt-10 flex flex-wrap items-stretch justify-center gap-6 sm:gap-10">
          {DOORS.map((door) => (
            <Link
              key={door.label}
              href={door.href}
              onClick={() => playClick()}
              className="pv-press pv-kiosk-target w-40 rounded-3xl p-4 text-center sm:w-48"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <span
                aria-hidden="true"
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl text-5xl sm:h-28 sm:w-28 sm:text-6xl"
                style={{ backgroundColor: door.color }}
              >
                {door.emoji}
              </span>
              <span className="mt-3 block text-xl font-extrabold text-white">{door.label}</span>
              <span className="mt-1 block text-sm font-semibold" style={{ color: "#e8e2d8" }}>
                {door.sub}
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-10 text-base" style={{ color: "#bdb5a7" }}>
          Staff and Families both lead to the same code pad. The code knows who you are.
        </p>
      </div>
    </main>
  );
}
