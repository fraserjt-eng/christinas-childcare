"use client";

// Persistent chrome for every signed-in portal screen: the brand bar, an Admin
// link for owner/admin sessions (the escape hatch into the back office), the
// sound toggle, and sign-out. Also rehydrates the persisted store exactly once
// after mount so the server render and the first client paint always match.

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick, setSoundEnabled } from "@/lib/preview/sound";

const ADMIN_ROLES = ["admin", "owner", "superadmin"];

export function PreviewChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const soundOn = usePreviewStore((s) => s.soundOn);
  const toggleSound = usePreviewStore((s) => s.toggleSound);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const result = usePreviewStore.persist.rehydrate();
    const sync = () => setSoundEnabled(usePreviewStore.getState().soundOn);
    if (result && typeof (result as Promise<void>).then === "function") {
      (result as Promise<void>).then(sync);
    } else {
      sync();
    }
  }, []);

  // Read the session role so owners/admins get a link into /admin from the
  // front-facing portal (so the admin back office is always one tap away).
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.user?.role) setIsAdmin(ADMIN_ROLES.includes(String(d.user.role).toLowerCase()));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  async function handleSignOut() {
    playClick();
    // Clear the real server session cookie, not just client state. Send everyone
    // to the access page (the four-door home), not the parent login.
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      /* best effort; redirect regardless */
    }
    window.location.href = "/start";
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="px-4 py-3 text-white sm:px-8" style={{ backgroundColor: "var(--pv-coral)" }}>
        <div className="mx-auto flex max-w-[1800px] items-center gap-3">
          <span className="pv-serif text-lg font-semibold leading-none sm:text-xl">
            Christina&apos;s Child Care Center
          </span>
          <span className="ml-auto flex items-center gap-2">
            {isAdmin && (
              <a
                href="/admin"
                className="pv-target rounded-lg px-3 py-1.5 text-sm font-bold"
                style={{ backgroundColor: "rgba(0,0,0,0.28)" }}
              >
                🗂️ Admin
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                playClick();
                toggleSound();
              }}
              className="pv-target rounded-lg px-3 py-1.5 text-sm font-bold"
              style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
            >
              {soundOn ? "🔊 Sound on" : "🔇 Sound off"}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="pv-target rounded-lg px-3 py-1.5 text-sm font-bold"
              style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
            >
              Sign out
            </button>
          </span>
        </div>
      </div>
      <div key={pathname} className="pv-page-enter flex-1">
        {children}
      </div>
    </div>
  );
}
