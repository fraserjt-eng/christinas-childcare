"use client";

// The three-door entry (design exploration section 01).
// One question, three doors. The PIN moment happens after the choice.
// Tadpoles look: light canvas, flat white cards, thin gray title, lucide
// line icons in the brand tints, christina-red as the accent. Big kiosk
// targets stay; routing is unchanged.

import Link from "next/link";
import { Users, KeyRound, Heart, type LucideIcon } from "lucide-react";
import { StepNote } from "@/components/preview/ui";
import { playClick } from "@/lib/preview/sound";

const DOORS: {
  href: string;
  label: string;
  sub: string;
  Icon: LucideIcon;
  color: string;
}[] = [
  {
    href: "/preview/kiosk",
    label: "Staff",
    sub: "Clock in or out",
    Icon: Users,
    color: "var(--pv-teal)",
  },
  {
    href: "/preview/office",
    label: "Office",
    sub: "Christina's view",
    Icon: KeyRound,
    color: "var(--pv-coral)",
  },
  {
    href: "/preview/kiosk",
    label: "Families",
    sub: "Check your kids in or out",
    Icon: Heart,
    color: "var(--pv-gold)",
  },
];

export default function DoorPage() {
  return (
    <main className="pv-tad px-4 py-6 sm:px-8">
      <div className="pv-rise mx-auto max-w-4xl" style={{ animationDelay: "60ms" }}>
        <StepNote step={1} text="The iPad in the lobby. One question, three big doors." />
      </div>
      <div
        className="pv-rise mx-auto mt-3 max-w-4xl rounded-lg border bg-white px-6 py-12 text-center shadow-sm sm:py-16"
        style={{ borderColor: "var(--pv-line)", animationDelay: "120ms" }}
      >
        <h1 className="pv-tad-title text-3xl sm:text-4xl">good morning! who&apos;s here?</h1>
        <div className="mt-10 flex flex-wrap items-stretch justify-center gap-6 sm:gap-10">
          {DOORS.map((door, i) => {
            const Icon = door.Icon;
            return (
              <Link
                key={door.label}
                href={door.href}
                onClick={() => playClick()}
                className="pv-lift pv-rise pv-kiosk-target w-40 rounded-lg border p-4 text-center sm:w-48"
                style={{
                  borderColor: "var(--pv-line)",
                  backgroundColor: "var(--pv-card)",
                  animationDelay: `${180 + i * 60}ms`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg sm:h-28 sm:w-28"
                  style={{ backgroundColor: `color-mix(in srgb, ${door.color} 14%, #ffffff)` }}
                >
                  <Icon size={48} strokeWidth={1.75} style={{ color: door.color }} />
                </span>
                <span className="mt-3 block text-xl font-semibold" style={{ color: "var(--pv-ink)" }}>
                  {door.label}
                </span>
                <span className="mt-1 block text-sm" style={{ color: "var(--pv-muted)" }}>
                  {door.sub}
                </span>
              </Link>
            );
          })}
        </div>
        <p className="mt-10 text-base" style={{ color: "var(--pv-muted)" }}>
          Staff and Families both lead to the same code pad. The code knows who you are.
        </p>
      </div>
    </main>
  );
}
