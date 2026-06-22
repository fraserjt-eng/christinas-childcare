"use client";

// A small, consistent Back + Home bar for the front-facing portal pages
// (/preview/*) that are not inside an admin sidebar layout. "Back" returns to
// wherever the person came from; "Home" goes to their role's home screen
// (parents -> their family page, staff/owner -> the office hub). Pages can
// override Home with the `home` prop when a more specific target makes sense.

import { useRouter } from "next/navigation";
import { useSessionUser } from "@/lib/use-session-user";
import { playClick } from "@/lib/preview/sound";

export function BackHome({ home }: { home?: string }) {
  const router = useRouter();
  const { user } = useSessionUser();
  const role = (user?.role || "").toLowerCase();
  const autoHome = role === "parent" ? "/preview/family" : "/preview/office";
  const homeHref = home || autoHome;

  const btn =
    "pv-press pv-target inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold";

  return (
    <div className="mb-4 flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          playClick();
          router.back();
        }}
        className={btn}
        style={{ color: "var(--pv-muted)" }}
        aria-label="Go back"
      >
        <span aria-hidden="true">←</span> Back
      </button>
      <button
        type="button"
        onClick={() => {
          playClick();
          router.push(homeHref);
        }}
        className={btn}
        style={{ color: "var(--pv-coral)" }}
        aria-label="Go to your home screen"
      >
        <span aria-hidden="true">⌂</span> Home
      </button>
    </div>
  );
}
